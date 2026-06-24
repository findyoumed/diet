$(function () {

  const $body = $("body");

  const parseMetaContent = (name) => {
    const metaTags = Array.from(document.getElementsByTagName("meta")).map((item) => ({
      name: item.name || item.getAttribute("property"),
      content: item.content,
    }));

    return metaTags.find((item) => item.name === name)?.content;
  };

  const langCode = window.g5_translate_lang ?? "ko";
  const shareUrl = window.location.href;
  const shareText = parseMetaContent("og:title") ?? window.document.title;
  const shareDescription = parseMetaContent("og:description") ?? "대한민국 1등 탈모커뮤니티 대다모! 탈모, 모발이식, 탈모샴푸, 모낭염 등의 탈모 관련 정보가 가득한 대한민국 최초/최대의 탈모 커뮤니티";
  const shareImageUrl = parseMetaContent("og:image") ?? `https://${window.location.hostname}/new/data/seo/sns_image_2025_${langCode}.png`;

  // $.i18n()이 호출 시점(클릭 시)에 평가되도록 함수로 감싼다 — i18n race 방지
  const getShareButtons = () => [
    {
      label: "X",
      className: "btn_sns twitter",
    },
    {
      label: $.i18n("common.share.btn.facebook"),
      className: "btn_sns facebook",
    },
    {
      label: $.i18n("common.text.kakao"),
      className: "btn_sns kakaotalk",
    },
    {
      label: "LINE",
      className: "btn_sns line",
    },
    {
      label: $.i18n("common.share.btn.naverblog"),
      className: "btn_sns blog",
    },
    {
      label: $.i18n("common.share.btn.naverband"),
      className: "btn_sns band",
    },
    {
      label: "Evernote",
      className: "btn_sns evernote",
    },
    {
      label: "LinkedIn",
      className: "btn_sns linkedin",
    },
    {
      label: "Pinterest",
      className: "btn_sns pinterest",
    },
  ];

  /**
   * 카카오톡 공유하기
   */
  const shareOnKakaoTalk = (url, text, description, imageUrl) => {
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: text,
        description: description,
        imageUrl: imageUrl,
        link: {
          webUrl: url,
          mobileWebUrl: url,
        },
      },
    });
  };

  /**
   * 트위터 공유하기
   */
  const shareOnTwitter = (url, text) => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURI(text)}`);
  };

  /**
   * 페이스북 공유하기
   */
  const shareOnFacebook = (url) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };

  /**
   * 네이버블로그 공유하기
   */
  const shareOnNaverBlog = (url, text) => {
    window.open(`https://blog.naver.com/openapi/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`);
  };

  /**
   * 네이버밴드 공유하기
   */
  const shareOnNaverBand = (url, text) => {
    window.open(`https://band.us/plugin/share?route=${encodeURIComponent(url)}&body=${encodeURIComponent(text)}`);
  };

  /**
   * LINE 공유하기
   */
  const shareOnNaverLine = (url, text) => {
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text + "\n" + url)}`);
  };

  /**
   * 링크드인 공유하기
   */
  const shareOnLinkedIn = (url) => {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`);
  };

  /**
   * 핀터레스트 공유하기
   */
  const shareOnPinterest = (url, text, imageUrl) => {
    window.open(`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}&mediaurl=${encodeURIComponent(imageUrl)}`);
  };

  /**
   * 에버노트 공유하기
   */
  const shareOnEvernote = (url, text) => {
    window.open(`https://www.evernote.com/clip.action?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`);
  };

  /**
   * 클립보드에 복사하기
   */
  const shareOnClipboard = async (url) => {
    const success = await copyToClipboard(url);

    if (success) {
      closeSharePopup();
      showModalAlert($.i18n("common.share.info.clipboard"));
    }
  };

  const openSharePopup = (url, text, description, imageUrl) => {
    closeSharePopup();

    const shareButtons = getShareButtons();

    const $sharePopup = $(`
      <div class="share_popup">
        <div class="share_popup_title">${$.i18n("common.share.title")}</div>
        <div class="share_popup_buttons">
          ${shareButtons.map(({ label, className }) => `<button type="button" title="${label}" class="${className}"><i /> ${label}</button>`).join("")}
        </div>
        <div class="share_popup_copylink">
          <p class="txt_copylink">${url}</p>
          <button type="button" class="btn_copylink" title="${$.i18n("common.share.btn.clipboard")}">
            <i class="fa fa-clone"></i>
          </button>
        </div>

        <button type="button" class="btn_share_popup_close" title="${$.i18n("common.text.window")}">
          <i class="fa fa-times"></i>
        </button>
      </div>
    `);

    $sharePopup.on("click", ".btn_sns.twitter", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnTwitter(url, text);
    });

    $sharePopup.on("click", ".btn_sns.facebook", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnFacebook(url);
    });

    $sharePopup.on("click", ".btn_sns.kakaotalk", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnKakaoTalk(url, text, description, imageUrl);
    });

    $sharePopup.on("click", ".btn_sns.line", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnNaverLine(url, text);
    });

    $sharePopup.on("click", ".btn_sns.blog", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnNaverBlog(url, text);
    });

    $sharePopup.on("click", ".btn_sns.band", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnNaverBand(url, text);
    });

    $sharePopup.on("click", ".btn_sns.evernote", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnEvernote(url, text);
    });

    $sharePopup.on("click", ".btn_sns.linkedin", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnLinkedIn(url);
    });

    $sharePopup.on("click", ".btn_sns.pinterest", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnPinterest(url, text, imageUrl);
    });

    $sharePopup.on("click", ".btn_copylink", function (e) {
      e.preventDefault();
      e.stopPropagation();

      shareOnClipboard(url);
    });

    $sharePopup.on("click", ".btn_share_popup_close", function (e) {
      e.preventDefault();
      e.stopPropagation();

      closeSharePopup();
    });

    $sharePopup.appendTo($body);
  };

  const closeSharePopup = () => {
    const $sharePopup = $(".share_popup", $body);

    if ($sharePopup.size() > 0) {
      $sharePopup.fadeOut(() => {
        $sharePopup.remove();
      });
    }
  };

  // 공유하기 버튼 클릭
  $body.on("click", ".btn_share", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $this = $(this);

    const url = decodeURIComponent($this.data("url") ?? shareUrl);
    const text = $this.data("text") ?? shareText;
    const description = $this.data("description") ?? shareDescription;
    const imageUrl = $this.data("image") ?? shareImageUrl;

    openSharePopup(url, text, description, imageUrl);
  });
});
