const chalk = require("chalk");
const helper = require("./helper");

const translate = async ({ page, astData = [], from = "zh", to = "en" }) => {
  if (!astData.length) return [];
  const translateData = astData.slice();
  let i = 0;
  do {
    let { value } = translateData[i];
    value = helper.trim(value);

    try {
      await page.goto(`https://fanyi.baidu.com/#${from}/${to}/${value}`, {
        timeout: 5000,
      });
      if (i === 0) await page.reload();

      const response = await page
        .waitForResponse(
          (res) =>
            res.url() ===
              `https://fanyi.baidu.com/v2transapi?from=${from}&to=${to}` &&
            res.status() === 200
        )
        .catch(async (err) => await page.reload());
      const data = await response.json();
      if (data.error) {
        throw new Error("访问出现异常，请稍后重试！");
      }
      const dst = data.trans_result.data[0]?.dst?.toLowerCase();

      translateData[i] = {
        ...translateData[i],
        dst,
      };

      if (to === "en") {
        const id = dst
          .split(" ")
          .slice(0, 4)
          .join("-")
          .replace(/([?!:;,.'']+|^-|-$)/g, "");

        translateData[i].id = id;
      }
    } catch (err) {
      console.error(`翻译【${value}】至【${to}】失败: ${err.message}`);
      global.untranslated = true;
    }

    // wait 1s
    // await new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve();
    //   }, 1000);
    // });

    i++;
  } while (i < translateData.length);

  return translateData;
};

module.exports = translate;
