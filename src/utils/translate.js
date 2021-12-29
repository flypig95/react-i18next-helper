const translate = async ({ page, astData = [], from = "zh", to = "en" }) => {
  const translateData = astData.slice();
  let i = 0;
  do {
    await page.goto(
      `https://fanyi.baidu.com/#${from}/${to}/${translateData[i].value}`
    );
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
    const dst = data.trans_result.data[0]?.dst?.toLowerCase();
    const id = dst
      .split(" ")
      .slice(0, 4)
      .join("-")
      .replace(/[?!:;,.'']+/g, "");

    translateData[i] = {
      id,
      dst,
      ...translateData[i],
    };

    // if (i === 10) {
    //   // wait 2s for 10 translation
    //   await new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //       resolve();
    //     }, 2000);
    //   });
    // }

    i++;
  } while (i < translateData.length);

  return translateData;
};

module.exports = translate;
