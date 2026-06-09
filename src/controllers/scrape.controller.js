const { scrapeGoogleMaps } = require('../../scraper/googleMaps');
const { scrapeWebsite } = require('../../scraper/websiteScraper');
exports.scrape = async (req, res) => {
    const { category, location, limit } = req.body;
    if (!category || !location) {
        return res.status(400).json({ error: 'Category and location are required.' });
    }

    try {
        const scrapeLimit = limit || 5;
        console.log(`Starting scrape for ${category} in ${location} (Target: ${scrapeLimit})...`);
        const results = await scrapeGoogleMaps(category, location, scrapeLimit);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ success: false, error: 'Failed to scrape data.' });
    }
};

exports.scrapeWebsite = async (req, res) => {
    const { url } = req.body;
    try {
        const results = await scrapeWebsite(url);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Website Scraping error:', error);
        res.status(500).json({ success: false, error: 'Failed to scrape website.' });
    }
};
