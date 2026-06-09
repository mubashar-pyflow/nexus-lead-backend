const puppeteer = require('puppeteer');

async function scrapeWebsite(url) {
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    console.log(`Deep crawling: ${url}`);
    
    // Launch puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    // Prevent loading heavy assets to speed up scraping
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait a slight moment for any SPA hydration
        await new Promise(r => setTimeout(r, 1500));

        const extracted = await page.evaluate(() => {
            const html = document.documentElement.outerHTML;
            const text = document.body.innerText;
            
            // Regex for emails
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
            const rawEmails = html.match(emailRegex) || [];
            
            // Clean out false positives (e.g., image.png@2x, sentry payloads)
            const strictEmails = Array.from(new Set(rawEmails)).filter(e => {
                const lower = e.toLowerCase();
                return !lower.endsWith('.png') && 
                       !lower.endsWith('.jpg') && 
                       !lower.includes('sentry') &&
                       !lower.includes('wixpress');
            });

            // Social media regex searches via href matching
            const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.href.toLowerCase());
            
            const socials = {
                linkedin: links.find(l => l.includes('linkedin.com/company/') || l.includes('linkedin.com/in/')) || null,
                twitter: links.find(l => l.includes('twitter.com/') || l.includes('x.com/')) || null,
                facebook: links.find(l => l.includes('facebook.com/') && !l.includes('sharer')) || null,
                instagram: links.find(l => l.includes('instagram.com/')) || null,
            };

            // Heuristic phone parsing (optional, supplementing maps)
            const phoneRegex = /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
            const phonesRaw = text.match(phoneRegex) || [];
            // Filter realistic phone lengths >= 10 digits stripped
            const strictPhones = Array.from(new Set(phonesRaw)).filter(p => p.replace(/\D/g, '').length >= 10);

            return {
                emails: strictEmails,
                socials: socials,
                phones: strictPhones.slice(0, 3) 
            };
        });

        await browser.close();
        return extracted;
    } catch (e) {
        console.error('Error deeply scraping website:', e);
        await browser.close();
        // Return structured fallback instead of full crashing so bulk scans can continue
        return {
            emails: [],
            socials: { linkedin: null, twitter: null, facebook: null, instagram: null },
            phones: [],
            error: e.message
        };
    }
}

module.exports = { scrapeWebsite };
