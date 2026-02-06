const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Tìm kiếm sách trên Tiki
 * @param {string} query - Tên sách cần tìm
 * @returns {Promise<Array>} Danh sách kết quả
 */
async function searchTiki(query) {
    try {
        const url = `https://tiki.vn/search?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const items = [];

        $('.product-item').each((i, el) => {
            if (i >= 3) return; // Giới hạn 3 sản phẩm
            const name = $(el).find('.name h3').text().trim() ||
                $(el).find('.style__Name-sc-139nb47-3').text().trim();
            const price = $(el).find('.price-discount__price').text().trim();
            const link = $(el).attr('href');

            if (name && price) {
                items.push({
                    source: 'Tiki',
                    name,
                    price,
                    link: link?.startsWith('http') ? link : `https://tiki.vn${link}`
                });
            }
        });
        return items;
    } catch (error) {
        console.error('[Tiki] Lỗi:', error.message);
        return [];
    }
}

/**
 * Tìm kiếm sách trên Fahasa
 * @param {string} query - Tên sách cần tìm
 * @returns {Promise<Array>} Danh sách kết quả
 */
async function searchFahasa(query) {
    try {
        const url = `https://www.fahasa.com/catalogsearch/result/?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const items = [];

        $('.product-item').each((i, el) => {
            if (i >= 3) return;
            const name = $(el).find('.product-name a').attr('title') ||
                $(el).find('.product-name').text().trim();
            const price = $(el).find('.price').text().trim();
            const link = $(el).find('.product-name a').attr('href');

            if (name && price) {
                items.push({
                    source: 'Fahasa',
                    name,
                    price,
                    link
                });
            }
        });
        return items;
    } catch (error) {
        console.error('[Fahasa] Lỗi:', error.message);
        return [];
    }
}

/**
 * Hàm chính tìm kiếm giá sách
 * @param {Object|string} args - Tham số đầu vào
 * @returns {Promise<string>} Kết quả tìm kiếm dạng text
 */
async function scrapeBook(args) {
    const query = typeof args === 'string' ? args : args?.query;

    if (!query) {
        return "❌ Vui lòng nhập tên sách cần tìm.";
    }

    console.log(`[BookScraper] Đang tìm: ${query}`);

    const [tikiResults, fahasaResults] = await Promise.all([
        searchTiki(query),
        searchFahasa(query)
    ]);

    const allResults = [...tikiResults, ...fahasaResults];

    if (allResults.length === 0) {
        return `❌ Không tìm thấy sách "${query}" trên Tiki hoặc Fahasa.`;
    }

    let response = `📚 **Giá sách cho "${query}"**\n\n`;

    allResults.forEach(item => {
        response += `🛒 **${item.source}**\n`;
        response += `📖 ${item.name}\n`;
        response += `💰 ${item.price}\n`;
        response += `🔗 [Xem chi tiết](${item.link})\n\n`;
    });

    return response;
}

// Export cho OpenClaw skill system
module.exports = {
    scrapeBook
};

// Chạy test nếu gọi trực tiếp
if (require.main === module) {
    const query = process.argv[2] || "Đắc Nhân Tâm";
    scrapeBook({ query }).then(console.log);
}
