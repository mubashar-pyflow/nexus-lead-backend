const puppeteer = require('puppeteer');
const { extractContactsFromPage } = require('./websiteScraper');

async function scrapeGoogleMaps(category, location, limit = 5) {
    const query = `${category} in ${location}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    
    // Launch puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
    });
    
    console.log(`Navigating to ${url}`);
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        await page.waitForSelector('div[role="feed"]', { timeout: 15000 }).catch(() => {
            console.log('Results feed not found. Might be a single result or no results.');
        });
        
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        let previousHeight = 0;
        let currentItemCount = 0;
        let scrollAttempts = 0;
        const maxAttempts = Math.max(10, Math.ceil(limit / 5) * 2); 
        
        while (currentItemCount < limit && scrollAttempts < maxAttempts) {
            const feedContainer = await page.$('div[role="feed"]');
            if (!feedContainer) break;
            
            previousHeight = await page.evaluate(el => el.scrollHeight, feedContainer);
            await page.evaluate(el => el.scrollTo(0, el.scrollHeight), feedContainer);
            
            await delay(1500); 
            
            currentItemCount = await page.evaluate(() => {
                return document.querySelectorAll('.hfpxzc').length;
            });
            
            const newFeedHeight = await page.evaluate(el => el.scrollHeight, feedContainer);
            if (newFeedHeight === previousHeight) {
                const isEndOfList = await page.evaluate(() => {
                    const spans = Array.from(document.querySelectorAll('span'));
                    return spans.some(span => span.textContent.includes("You've reached the end of the list."));
                });
                if (isEndOfList) break;
            }
            scrollAttempts++;
        }
        
        console.log('Extracting items...');
        
        const extracted = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.hfpxzc')); 
            
            return items.map((el, i) => {
                const parent = el.closest('.UaQhfb') || el.parentElement?.parentElement;
                const name = el.getAttribute('aria-label') || '';
                
                let website = '';
                
                if (parent) {
                    const links = Array.from(parent.querySelectorAll('a[href^="http"]'));
                    if (links.length > 0) {
                        website = links[0].href;
                    }
                }
                
                return {
                    id: `biz-${Date.now()}-${i}`,
                    name,
                    link: el.href,
                    website,
                };
            }).filter(item => item.name); 
        });
        
        const detailedResults = [];
        const numToScrape = Math.min(extracted.length, limit);
        
        for (let i = 0; i < numToScrape; i++) {
            const biz = extracted[i];
            console.log(`Scraping details for ${biz.name}...`);
            await page.goto(biz.link, { waitUntil: 'domcontentloaded' });
            await delay(1000);
            
            const details = await page.evaluate(() => {
                const infoStr = document.body.innerText;
                const phoneMatch = infoStr.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                const phone = phoneMatch ? phoneMatch[0] : '';
                
                const addressBtn = document.querySelector('button[data-tooltip="Copy address"]');
                const address = addressBtn ? (addressBtn.getAttribute('aria-label') || '').replace('Address: ', '') : '';
                
                const websiteBtn = document.querySelector('a[data-tooltip="Open website"]');
                const websiteUrl = websiteBtn ? websiteBtn.href : '';
                
                return { phone, address, websiteUrl };
            });
            
            detailedResults.push({
                ...biz,
                phone: details.phone,
                address: details.address || 'Address not found',
                website: details.websiteUrl || biz.website || 'No website',
                email: 'N/A', // Filled in by the enrichment pass below
                emails: [],
                socialMedia: 'N/A'
            });
        }

        // Enrich each lead by visiting its website and extracting emails/socials.
        // Use a dedicated page with asset blocking so these visits stay fast and
        // don't interfere with the Maps navigation above.
        const enrichPage = await browser.newPage();
        await enrichPage.setRequestInterception(true);
        enrichPage.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        for (const biz of detailedResults) {
            const site = biz.website;
            if (!site || site === 'No website') continue;

            const target = site.startsWith('http') ? site : `https://${site}`;
            try {
                console.log(`Extracting email for ${biz.name} from ${target}...`);
                await enrichPage.goto(target, { waitUntil: 'domcontentloaded', timeout: 20000 });
                await delay(800);

                const contact = await extractContactsFromPage(enrichPage);
                if (contact.emails.length > 0) {
                    biz.emails = contact.emails;
                    biz.email = contact.emails[0];
                }
                const foundSocials = Object.values(contact.socials).filter(Boolean);
                if (foundSocials.length > 0) {
                    biz.socialMedia = foundSocials.join(', ');
                    biz.socials = contact.socials;
                }
            } catch (e) {
                console.log(`Email enrichment failed for ${biz.name}: ${e.message}`);
            }
        }

        await browser.close();
        return detailedResults;
        
    } catch (e) {
        console.error('Error during scraping:', e);
        await browser.close();
        throw e;
    }
}

module.exports = { scrapeGoogleMaps };
