import 'expect-puppeteer';

describe('Google', () => {
    beforeAll(async () => {
        await page.goto('https://google.com');
    });

    test('should be titled "Google"', async () => {
        await expect(page.title()).resolves.toMatch('Google');
    });
});

describe('Lightview', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:8080/test/basic.html');
    });

    test('should be titled "Basic"', async () => {
        await expect(page.title()).resolves.toMatch('Basic');
    });

    test('color should be exported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return el.getAttribute("color");
        });
        expect(result).toBe("green");
    });
    test('color should be exported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return JSON.parse(el.getAttribute("checked"));
        });
        expect(result).toBe(true);
    });
    test('color should be exported', async () => {
        const result = await page.evaluate(() => {
            const el = document.getElementById("test");
            return JSON.parse(el.getAttribute("hamburger"));
        });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe("lettuce");
    });
});