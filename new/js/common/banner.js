$(function () {
  /**
   * "오늘 하루 열지않음" 쿠키 설정
   * @param {*} name
   * @param {*} value
   * @param {*} days
   */
  function setdayCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  /**
   * "오늘 하루 열지않음" 쿠키값 조회
   * @param {*} name
   * @returns
   */
  function getdayCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /* 광고배너 */
  const $advertiseBanner = $(".banner-container");

  if ($advertiseBanner.size() > 0) {
    const BANNER_TYPE = $advertiseBanner.data("banner_type");

    $(".btn_close", $advertiseBanner).on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $this = $(this);

      if ($this.hasClass("active")) {
        if (confirm($.i18n("banner.confirm.hideForOneDay"))) {
          setdayCookie(BANNER_TYPE, 1, 1);
          $advertiseBanner.fadeOut();
        } else {
          $this.removeClass("active").text($.i18n("banner.btn.advertise"));
        }
      } else {
        $this.addClass("active").text($.i18n("banner.btn.hideAdvertise"));
      }
    });
  }

  /* 스티커형 배너광고 */
  const $stickerBanner = $("#floatingStickerBanner");

  if ($stickerBanner.size() > 0) {
    if (!getdayCookie("stickerBanner")) {
      const bo_table = $stickerBanner.data("bo_table");
      const wr_id = $stickerBanner.data("wr_id");

      $.post(
        "/api/banner/sticker.ajax.php",
        {
          bo_table,
          wr_id,
        },
        function (result) {
          const { banner } = result;

          if (result.code === 1) {
            $stickerBanner
              .append(
                `
              <button type="button" alt="닫기" class="btn-close closeBtn"><img src="../../../images/remote/image.dieton.com/images/img/renew/i_close_black.svg" alt="닫기"/></button>
              <a href="${banner?.link_url}" class="banner-inner btn_banner_link" target="${banner?.link_target === "new" ? "_blank" : ""}" data-banner_type="sticker" data-banner_id="${banner?.seq}">
                  <img src="${banner?.banner_image}" alt="${banner?.title}">
              </a>
              `,
                // <div class="btn-wrap">
                //   <input type="checkbox" name="save_cookie" id="saveCookieForSticker">
                //   <label for="saveCookieForSticker">오늘 하루 보지 않기</label>
                //   <button type="button" alt="닫기" class="btn-close closeBtn" >[닫기]</button>
                // </div>
              )
              .show();
          }
        },
      );
    }

    // 닫기 및 쿠키저장
    $(document).on("click", "#floatingStickerBanner .closeBtn", function (e) {
      // const isChecked = $(this).closest("#floatingStickerBanner").find("#saveCookieForSticker").is(":checked");
      // if (isChecked) {
      setdayCookie("stickerBanner", "skip", 1);
      // }
      $stickerBanner.hide();
    });
  }

  //  ------- ** 이벤트 팝업 닫기 및 쿠키저장 ** -------
  // 이벤트 안내 팝업 (drlist - DietOn event_20250908)
  checkCookieForEventPop("godDoctorEventPop");
  setCookieEventPop("godDoctorEventPop");

  // 팝업 표시 (쿠키체크)
  function checkCookieForEventPop(eventPopElement) {
    const $oneLineReivewEventPop = $(`#eventGuidePop.${eventPopElement}`);
    if ($oneLineReivewEventPop.size() > 0) {
      if (!getdayCookie(eventPopElement)) {
        $oneLineReivewEventPop.show();
        $("body").addClass("not_scroll");
      } else {
        $oneLineReivewEventPop.hide();
        $("body").removeClass("not_scroll");
      }
    }
  }
  // 팝업 내부 쿠키 표시
  function setCookieEventPop(eventPopElement) {
    $(document).on("click", "#eventGuidePop .closeBtn", function (e) {
      const $oneLineReivewEventPop = $("#eventGuidePop");
      const isChecked = $(this).closest("#eventGuidePop").find(`#saveCookieFor_${eventPopElement}`).is(":checked");
      if (isChecked) {
        setdayCookie(eventPopElement, "skip", 1);
      }
      if (!$(this).hasClass("btnLink")) {
        $oneLineReivewEventPop.hide();
        $("body").removeClass("not_scroll");
      }
    });
  }
});
