/**
 * 공지사항 및 컨텐츠 접고 펼치기
 * @param {*} btnEllement jquery ellement
 * @param {*} hideEllement jquery ellement
 * @param {*} text optional ["접기", "보기"]
 */
function addEventHideToggoleText(btnEllement, hideEllement, text) {
  $(document).on("click", btnEllement, function () {
    if (text) {
      $(this).text($(hideEllement).is(":visible") ? text[1] : text[0]);
    }
    $(hideEllement).toggle();
  });
}

/**
 *  "on" class toggle -> 개별적으로 toggle 클래스
 * @param {*} btnEllement selector (string)
 * @param {*} ellement selector (string)
 * @param {*} callback function optional
 */
function toggleOnClass(btnEllement, ellement, callback = () => {}) {
  $(document).on("click", btnEllement, function () {
    $(this).toggleClass("on");
    $(ellement).toggleClass("on");
    if (callback) {
      callback();
    }
  });
}

/**
 *  "on" class only one -> ellement별 하나만 클래스 추가 (토글X)
 * @param {*} btnEllement selector (string)  ex) "#funcsList li"
 * @param {*} callback function optional
 */
function addOnClassOne(btnEllement, callback = () => {}) {
  $(document).on("click", btnEllement, function (e) {
    $(btnEllement).removeClass("on");
    $(this).addClass("on");
    if (callback) {
      callback();
    }
  });
}

/**
 *  "on" class toggle only one -> ellement별 하나만 클래스 추가 + 토글
 * @param {*} btnEllement selector (string)  ex) "#funcsList li"
 * @param {*} callback function optional
 */
function addOnClassOneToggle(btnEllement, callback = () => {}) {
  $(document).on("click", btnEllement, function (e) {
    const $this = $(this);

    if ($this.hasClass("on")) {
      $this.removeClass("on");
    } else {
      $(btnEllement).removeClass("on");
      $this.addClass("on");
    }

    if (callback) {
      callback($this);
    }
  });
}

/**
 * URL에 현재 언어 설정을 적용하여 반환
 *
 * - SEO 경로:    /photo2       → /jp/photo2
 * - 내부 경로:   /new/bbs/...  → /new/bbs/...?hl=ja
 * - ko(기본값)는 변환 없이 원본 반환
 *
 * @param {string} url 변환할 URL
 * @returns {string} 언어가 적용된 URL
 */
function ddmLangUrl(url) {
  if (!url) return url;

  const currentLangCode = window.g5_translate_lang ?? "ko";
  const currentLangPath = window.g5_translate_path ?? ""; // e.g. "/jp", "/en", "/cn"

  if (currentLangCode === "ko" || !currentLangPath) return url;

  try {
    const isAbsolute = /^https?:\/\//i.test(url);
    const urlObj = new URL(url, location.origin);
    const pathname = urlObj.pathname;

    // /new/ 내부 경로 → hl 쿼리 파라미터 추가
    if (pathname.startsWith("/new/")) {
      urlObj.searchParams.set("hl", currentLangCode);
      return isAbsolute ? urlObj.toString() : urlObj.pathname + urlObj.search + urlObj.hash;
    }

    // SEO 경로 → 언어 prefix 추가 (이미 적용된 경우 제외)
    const langPrefixes = ["/en/", "/jp/", "/cn/"];
    const hasLangPrefix = langPrefixes.some((p) => pathname.startsWith(p));

    if (!hasLangPrefix) {
      const newPathname = currentLangPath + pathname;
      urlObj.pathname = newPathname;
      return isAbsolute ? urlObj.toString() : newPathname + urlObj.search + urlObj.hash;
    }
  } catch (e) {
    return url;
  }

  return url;
}

/**
 * nice-select 초기화 후, option에 img가 포함된 select의 이미지를 UI에 동기화
 * - 모든 .nice-select에 공통 적용
 * - img가 없는 select는 skip
 * 현재 hospital(jp) 페이지에 별도 js로 적용중  -> 추후 공통 처리
 */
function niceSelectSyncImages() {
  $(".nice-select").each(function () {
    const $uiSelect = $(this);
    const $realSelect = $uiSelect.prev("select");

    if (!$realSelect.length) return;
    if (!$realSelect.find(`option`).data("icon")) return;

    $uiSelect.find(".list .option").each(function () {
      const $li = $(this);
      const $opt = $realSelect.find(`option[value="${$li.data("value")}"]`);
      const $img = $("<img>").attr({
        src: $opt.data("icon"),
        alt: $opt.data("icon-alt"),
        class: $opt.data("icon-class"),
      });
      $li.prepend($img);
    });

    const $selected = $uiSelect.find(".list .option.selected");
    if ($selected.length) {
      $uiSelect.find(".current").html($selected.html());
    }

    $uiSelect.find(".option").on("click.niceSelectSyncImages", function () {
      $uiSelect.find(".current").html($(this).html());
    });
  });
}

$(function () {
  const IS_MEMBER = Number(window.g5_is_member ?? "0") === 1;

  /* nice-select option 내 img 동기화 */
  // setTimeout(niceSelectSyncImages, 0);

  const langCode = window.g5_translate_lang ?? "ko";
  const langPath = window.g5_translate_path ?? "";

  const $body = $("body");
  const $recommendContainer = $(".recommend_box");

  /**
   * 로그인 페이지로 이동
   * @param {*} bo_table
   * @param {*} wr_id
   */
  function confirmLoginAction(bo_table, wr_id) {
    showModalConfirm($.i18n("common.confirm.login")).then(function (result) {
      if (result === true) {
        window.location.href = `/new/bbs/login.php?url=${langPath}/${bo_table}/${wr_id}&hl=${langCode}`;
      }
    });
  }

  /**
   * 게시글 "좋아요/싫어요" 데이터 처리
   * @param {*} bo_table
   * @param {*} wr_id
   * @param {*} action
   */
  function recommendDataAction(bo_table, wr_id, action) {
    let mode = "";

    if (action !== "status") {
      mode = $recommendContainer.data("status") === action ? "delete" : "insert";
    }

    const currentGoods = Number($(".good span", $recommendContainer).text().replace(/,/g, "") || "0");
    const nextStatus = mode === "delete" || action === "status" ? "" : action;
    const result = {
      code: 1,
      status: nextStatus,
      goods: action === "good" && mode === "insert" ? currentGoods + 1 : currentGoods,
    };
    (function (result) {
        const { code, status, goods } = result;

        $recommendContainer.data({ status: status });

        if (code == 1) {
          if (action !== "status" && ["good", "nogood"].includes(status)) {
            $(".recommend_message", $recommendContainer)
              .stop()
              .html($.i18n(status === "good" ? "recommend.info.liked.user" : "recommend.info.hated.user"))
              .fadeToggle(1000)
              .fadeOut(500);
          }

          $(".good span", $recommendContainer).html(goods > 0 ? formattedNumber(goods) : "");

          $(".recommend_btns .btn", $recommendContainer).removeClass("on");
          $(".recommend_btns .btn .icon", $recommendContainer).removeClass("on");
          $(".recommend_list", $recommendContainer).empty();

          if (status == "good") {
            $(".recommend_btns .btn.good", $recommendContainer).addClass("on");
            $(".recommend_btns .btn.good .icon", $recommendContainer).addClass("on");
          } else if (status == "nogood") {
            $(".recommend_btns .btn.nogood", $recommendContainer).addClass("on");
            $(".recommend_btns .btn.nogood .icon", $recommendContainer).addClass("on");
          }
        } else if (action != "status") {
          switch (code) {
            case -2:
              confirmLoginAction(bo_table, wr_id);
              break;
            case -3:
              showModalAlert($.i18n("common.board.errors.notFound"));
              break;
            case -4:
              showModalAlert($.i18n("common.board.errors.unsupported.like"));
              break;
            case -5:
              showModalAlert($.i18n("common.board.errors.unsupported.hate"));
              break;
            case -6:
              showModalAlert($.i18n("common.article.errors.notFound"));
              break;
            case -7:
              showModalAlert($.i18n("common.recommend.errors.articleWriter"));
              break;
            case -8:
              showModalAlert($.i18n("common.recommend.errors.duplicated.article.like"));
              break;
            case -9:
              showModalAlert($.i18n("common.recommend.errors.duplicated.article.hate"));
              break;
            default:
              showModalAlert(result.message);
              break;
          }
        }

        $recommendContainer.css({ opacity: 1 });
      })(result);
  }

  /**
   * 게시글 내부 comment로 스크롤 이동
   * class -> .btnGoComment
   */
  $body.on("click", ".btnGoComment", function (e) {
    e.preventDefault();

    const $comment = $(".board-comment-list").size() !== 0 ? $(".board-comment-list") : $("#mw_basic_comment_write");
    $comment.get(0).scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /**
   * 뒤로가기 버튼 (historyBack)
   * class -> .btnGoHistoryBack
   */
  $body.on("click", ".btnGoHistoryBack", function (e) {
    e.preventDefault();
    window.history.back();
  });

  /**
   * 게시글 목록 / 상세 내부 "안내"버튼 - tooltip
   * <button class="btnTooltip" ></button>
   * bo_table : string
   * is_experts : boolean - 전문가 상담 페이지 목록
   */
  $body.on("click", ".btnTooltip", function () {
    const BOARD_ID = $(this).data("bo_table");
    const isExperts = $(this).data("is_experts");
    let text = "";
    if (["hospitalphoto", "graftover"].includes(BOARD_ID)) {
      text = $.i18n("common.banner.tooltip.hospital");
    } else if (["photo3"].includes(BOARD_ID) || isExperts) {
      text = $.i18n("common.banner.tooltip.photo2");
    } else if (["photo2"].includes(BOARD_ID)) {
      text = $.i18n("common.banner.tooltip.photo2");
    } else {
      text = "";
    }

    const $tooltipBox = $(this).parent().children(".common-tooltip-box");
    if (!text) return;

    if ($tooltipBox.length === 0) {
      const tooltipBoxHtml = `<div class="common-tooltip-box">${text}</div>`;
      $(this).parent().append(tooltipBoxHtml);
    } else {
      $tooltipBox.remove();
    }
  });

  /**
   * 게시글 "스크랩" 버튼
   */
  $body.on("click", ".btn_scrap", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $button = $(this);
    const { bo_table, wr_id } = $button.data();

    if (bo_table && wr_id) {
      if (IS_MEMBER) {
        $.post(
          "/api/board/scrap.ajax.php",
          { bo_table, wr_id },
          function ({ code, scrapCount }) {
            $("span:last-child", $button).html(Number(scrapCount).toLocaleString());

            switch (code) {
              case 1:
                $button.toggleClass("on");
                $(".i_scrap_blue_16", $button).toggleClass("on");
                break;
              case -2:
                confirmLoginAction(bo_table, wr_id);
                break;
              default:
                showModalAlert($.i18n("errorSystem"));
                break;
            }
          },
          "json",
        );
      } else {
        confirmLoginAction(bo_table, wr_id);
      }
    }
  });

  /**
   * 게시글 "신고하기" 버튼
   */
  $body.on("click", ".btn_report", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $button = $(this);
    const { bo_table, wr_id } = $button.data();

    if (bo_table && wr_id) {
      window.open(`/new/popup/board_report.php?bo_table=${bo_table}&wr_id=${wr_id}&hl=${langCode}`, "report_popup", "width=500,height=450");
    }
  });

  /**
   * 게시글 "인쇄하기" 버튼
   */
  $body.on("click", ".btn_print", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $button = $(this);
    const { bo_table, wr_id } = $button.data();

    if (bo_table && wr_id) {
      window.open(`/new/popup/board_print.php?bo_table=${bo_table}&wr_id=${wr_id}&hl=${langCode}`, "print_popup", "width=800,height=600,scrollbars=yes");
    }
  });

  /**
   * 게시글 "삭제하기" 버튼
   */
  $body.on("click", ".btn_article_delete", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $button = $(this);
    const { bo_table, wr_id } = $button.data();

    if (bo_table && wr_id) {
      showModalConfirm($.i18n("common.article.confirm.delete")).then(function (result) {
        if (result === true) {
          showLoadingOverlay();

          $.post(
            "/api/board/article.ajax.php",
            {
              mode: "delete",
              bo_table: bo_table,
              wr_id: wr_id,
            },
            function (result) {
              hideLoadingOverlay();

              switch (result.code) {
                case -1:
                case -3:
                case 1:
                  window.location.href = `${langPath}/${bo_table}`;
                  break;
                case -2:
                  window.location.href = `/new/bbs/login.php?url=${window.location.href}&hl=${langCode}`;
                  break;
                case -4:
                  showModalAlert($.i18n("common.article.error.permission.delete"));
                  break;
                case -5:
                  showModalAlert($.i18n("common.article.error.permission.delete.reply"));
                  break;
                case -6:
                  showModalAlert($.i18n("common.article.error.permission.delete.comment"));
                  break;
                default:
                  showModalAlert(result.message);
                  break;
              }
            },
          );
        }
      });
    }
  });

  /**
   * 게시글 "좋아요/싫어요" 버튼
   */
  if ($recommendContainer.size() > 0) {
    const { bo_table, wr_id } = $recommendContainer.data();

    $recommendContainer.on("click", ".recommend_btns .btn", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const { action } = $(this).data();

      recommendDataAction(bo_table, wr_id, action);
    });

    recommendDataAction(bo_table, wr_id, "status");
  }

  /**
   * 제품 구매하기 CTA 링크
   */
  $body.on("click", ".btn-purchase", function (e) {
    const $this = $(this);
    const { bo_table, wr_id, link_url } = $this.data();

    if (bo_table && wr_id && link_url) {
      window.open(link_url, `purchase_cta_link-${bo_table}-${wr_id}`);

      $.post("/api/board/article.ajax.php", {
        mode: "cta_hits",
        bo_table: bo_table,
        wr_id: wr_id,
      });
    }
  });

  // (목록 페이지) 글쓰기 버튼 공지 alert 공통처리
  $body.on("click", ".common-btn-main.commonBtnWrite", function (e) {
    const href = $(this).attr("href");
    const noticeText = $(this).data("notice_text");
    if (!noticeText) return;
    e.preventDefault();

    showModalAlert(noticeText).then(function () {
      location.href = href;
    });
  });
});
