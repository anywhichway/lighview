import 'expect-puppeteer';

describe('Lightview:Example:Counter', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:8080/examples/counter.html');
    });

    test('should be titled "Lightview:Examples:Counter"', async () => {
        await expect(page.title()).resolves.toMatch("Lightview:Examples:Counter");
    });

    test('count should be a variable', async () => {
        const result = await page.evaluate(async () => {
            return document.body.getVariable("count");
        });
        expect(result).toBeDefined();
        const {name,type,value,reactive} = result;
        expect(name).toBe("count");
        expect(type).toBe("number");
        expect(value).toBe(0);
        expect(reactive).toBe(true);
    });

    test('bump should be called', async () => {
        const result = await page.evaluate(async () => {
            document.body.bump();
            return document.body.getVariableValue("count");
        });
        expect(result).toBe(1);
    });

    test('click should bump', async () => {
        const buttonHandle = await page.evaluateHandle('document.body.querySelector("button")');
        await buttonHandle.click();
        const result = await page.evaluate(async () => {
            return document.body.getVariableValue("count");
        });
        expect(result).toBe(2);
    });

    test("should be custom element", async() => {
        const result = await page.evaluate(async () => {
           return document.body.constructor.name;
        });
        expect(result).toBe("CustomElement");
    })
})