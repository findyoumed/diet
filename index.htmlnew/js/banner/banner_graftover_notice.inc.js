// [LOG: 20260623_2046] Localized notice banner script to call local api endpoint
window.graftoverBannerDatasets = window.graftoverBannerDatasets || {};

$(function () {
  const langCode = window.g5_translate_lang ?? "ko";
  const langPath = window.g5_translate_path ?? "";

  function loadDatasets(datasetName) {
    return new Promise((resolve) => {
      if (window.graftoverBannerDatasets[datasetName]) {
        resolve(window.graftoverBannerDatasets[datasetName]);
      } else {
        $.ajax({
          method: "GET",
          url: "/api/banner/graftover.ajax.php",
          data: {
            hl: langCode,
          },
          dataType: "json",
          success: function (data) {
            window.graftoverBannerDatasets[datasetName] = data;
            resolve(data);
          },
        });
      }
    });
  }

  async function renderGraftoverBanner(datasetName) {
    const datasets = await loadDatasets(datasetName);

    const graftoverNoticeBanner = $(".graftover-notice-banner");
    if (graftoverNoticeBanner && graftoverNoticeBanner.length > 0) {
      // 공통 로직
      const keys = ["estimates", "requests"];
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const randomData = datasets[randomKey];

      if (randomData.length > 0) {
        $("body").addClass("graftoverBanner-active");
        graftoverNoticeBanner.find(".bannerNum").text(`+${datasets.count ?? 0}`);
        graftoverNoticeBanner.addClass(randomKey);
        const htmlContent = createBannerContent(randomKey, randomData);
        graftoverNoticeBanner.find(".bannerInner").html(`<p>${htmlContent}</p><p>${htmlContent}</p>`);
      }
    }
  }

  function createBannerContent(randomKey, randomData) {
    let htmlContent = "";
    const config = {
      estimates: {
        size: 4,
        textKey: "bannerEstimatesText",
        formatter: (item) => item,
      },
      requests: {
        size: 5,
        textKey: "bannerRequestsText",
        formatter: (item) => item.slice(0, 3) + $.i18n("banner.nickname"),
      },
    };

    const currentConfig = config[randomKey];

    if (!currentConfig) {
      return htmlContent;
    }

    const { size, textKey, formatter } = currentConfig;

    const targetSpanCount = 4;
    const chunkSize = Math.max(
      size,
      Math.ceil(randomData.length / targetSpanCount)
    );

    // 1) span 생성
    const spans = [];
    for (let i = 0; i < randomData.length; i += chunkSize) {
      const filtered = randomData.slice(i, i + chunkSize).map(formatter);
      const filteredText = filtered.join(", ") + $.i18n(textKey);
      spans.push(`<span>${filteredText}</span>`);
    }

    // 2) 결과가 적으면 복제로 채워 항상 4개로 맞춤
    let allSpans = [...spans];
    while (allSpans.length > 0 && allSpans.length < targetSpanCount) {
      allSpans = allSpans.concat(spans);
    }
    allSpans = allSpans.slice(0, targetSpanCount);

    return allSpans.join("");
  }

  whenI18nReady(() => renderGraftoverBanner("graftover"));
});
