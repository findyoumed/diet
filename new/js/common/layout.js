/**
 * 숫자 올라가는 ui
 * @param {*} ellement selector (string)
 * @param {*} duration number optional
 * data-num 속성에 숫자를 넣어주어야 함
 */
function countTo(ellement, duration = 2000) {
  const $counter = $(ellement);
  const targetNumber = $counter.data("num");
  let startTime = performance.now();
  let startNumber = 0;

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 14);
    const currentNumber = Math.round(startNumber + (targetNumber - startNumber) * easedProgress);

    $counter.text(currentNumber);

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  requestAnimationFrame(updateCounter);
}

/**
 * 컨텐츠 영역(main) blur 처리
 * @param {*} filter :string 'hlist' | 'login' | 'blocked'
 */
function addContainerBlur(filter) {
  whenI18nReady(() => _addContainerBlur(filter));
}

function _addContainerBlur(filter) {
  if (!["hlist", "login", "blocked"].includes(filter)) return;

  const langCode = window.g5_translate_lang ?? "ko";
  const IS_ADMIN_USER = (window.g5_is_admin ?? "") !== "";

  const isMobile = $("body").hasClass("mobile");
  const blurContent = isMobile ? "#mobileWrapper" : "#mw5 .container .main";
  const blurContainer = isMobile ? "#mw_mobile" : "#mw5.wrapper";
  const loginCallbackUrl = window.location.search ? "" : encodeURIComponent(window.location.href);

  console.log("[addContainerBlur]", loginCallbackUrl);

  let popHtml;

  if (filter === "login") {
    popHtml = `
      <div class="kakao_sync_popup">
        <div class="txt">
          <h3>${$.i18n("common.sign.title")}</h3>
          <h4>${$.i18n("common.guestPanel.subtitle")}</h4>
        </div>
        <div class="btns">
        ${
          langCode === "ja"
            ? `
            <div class="flex btn common-btn-line-login">
              <img src="../../../images/remote/image.dieton.com/images/img/renew/icon/i_line.svg" alt="LINE">
              ${$.i18n("common.sign.lineLogin")}
            </div>
            `
            : `
            <div class="flex btn btn-kakao-join">
              <img src="../../../images/remote/image.dieton.com/images/img/renew/icon/i_login_kakao.png" alt="${$.i18n("common.text.kakao")}">
              ${$.i18n("common.sign.kakao")}
            </div>
          `
        }
          <a href="/new/bbs/login.php?hl=${langCode}&url=${loginCallbackUrl}" class="register_email">
            <img src="../../../images/remote/image.dieton.com/images/img/renew/icon/i_login_email.png" alt="${$.i18n("common.register.startEmail")}">
            ${$.i18n("common.guestPanel.emailStart")}
          </a>
        </div>

        <a href="/new/bbs/register_form.php?hl=${langCode}" class="txtlink">${$.i18n("common.guestPanel.invite")}</a>
      </div>
    `;
  } else if (filter === "hlist") {
    popHtml = `
      <div class="hlist-popup">
        <div class="txt">
          <h3>
            <img src="../../../images/remote/image.dieton.com/images/img/renew/icon/2025/i_notice_circle.svg" alt=""> ${$.i18n("common.text.guide")}
          </h3>
          <p>${$.i18n(`containerBlurNoGlobal${isMobile ? "_mobile" : ""}`)}</p>
        </div>
      </div>
    `;
  } else if (filter === "blocked") {
    popHtml = `
      <div class="hlist-popup">
        <div class="txt">
          <h3>
            <img src="../../../images/remote/image.dieton.com/images/img/renew/icon/2025/i_notice_circle.svg" alt=""> ${$.i18n("common.text.guide")}
          </h3>
          <p>${$.i18n("common.guestPanel.blocked")}</p>
        </div>
      </div>
      ${IS_ADMIN_USER ? `<div class="btns"><button type="button" class="btn_blocked_remove">내용보기</button></div>` : ""}
    `;
  }

  const $blurContainer = $(`
    <div class="container-blur-wrap containerBlur${filter}Wrap ${filter}">
      <div class="container-blur-block"></div>
      <div class="container-blur-pop">${popHtml}</div>
    </div>
  `);

  $(blurContent).addClass(`container-${filter}-blur`);
  $(blurContainer).append($blurContainer);

  // 카카오로 시작하기
  $(".btn-kakao-join", $blurContainer)
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      window.location.href = `/new/oauth/kakao.php?action=login&hl=${langCode}&callback=${loginCallbackUrl}`;
    });

  // LINE으로 로그인
  $(".common-btn-line-login", $blurContainer)
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      window.location.href = `/new/oauth/line.php?action=login&hl=${langCode}&callback=${loginCallbackUrl}`;
    });

  // [관리자] 블라인드 게시글 원문보기
  $(".btn_blocked_remove", $blurContainer).on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    $blurContainer.remove();
    $(blurContent).removeClass(`container-${filter}-blur`);
  });
}

$(function () {
  const $window = $(window);

  /**
   * notice 이벤트페이지 스크롤 이벤트   "ani_scroll"
   */
  function scrollAnim() {
    const anims = [...document.querySelectorAll(".ani_scroll")];

    const height = $(window).innerHeight();
    const point = height;
    function observerFun(item) {
      var pos = $(item).offset().top;

      if (pos < window.scrollY + point) {
        $(item).addClass("on");
      } else {
        $(item).removeClass("on");
      }
    }

    anims.forEach((anim) => {
      observerFun(anim);
    });
  }

  // scroll animtaion
  $window.on("scroll resize", scrollAnim).trigger("resize");

  // header 검색바 DietOn now slide
  new Swiper(".headerNowListSwiper", {
    slidesPerView: 1,
    direction: "vertical",
    loop: true,
    allowTouchMove: false,
    speed: 800,
    autoplay: {
      disableOnInteraction: false,
    },
    effect: "slide",
    on: {
      slideChange: function () {
        const currentIdx = this.realIndex;
        if (currentIdx === 0) {
          this.params.autoplay.delay = 4000;
        } else {
          this.params.autoplay.delay = 1500;
        }
        this.autoplay.start();
      },
    },
  });

  //header 알림 - 말풍선 팝업
  // $("#btnHeaderAlarm").on("click", function () {
  //   const popupClass = "header-alarm-popup";
  //   if ($(this).parent().find(`.${popupClass}`).length > 0) {
  //     $(this).parent().find(`.${popupClass}`).remove();
  //     return;
  //   }
  //   $(this).parent().append(`
  //       <div class="${popupClass}">
  //         <div class="popup-inner">
  //           <ul>
  //             <li>
  //               <a href="#">
  //                 <p><span>닉네임</span> 회원님이 게시물에 댓글을 남겼습니다.</p>
  //                 <span>약 3일전</span>
  //               </a>
  //             </li>
  //           </ul>
  //           <a href="#" class="btn-more">전체 보기</a>
  //         </div>
  //       </div>
  //     `);
  //   return;
  // });

  //header all menu popup 열기
  $("#btnHeaderAllMenu").on("click", function () {
    $("#headerAllMenuPopup").fadeIn();
  });

  //header all menu popup 닫기
  $("#btnCloseAllMenu").on("click", function () {
    $("#headerAllMenuPopup").fadeOut();
  });

  //header search popup
  $("#headerSearchBox").on("click", function () {
    $("#search_popup_wrap").stop().fadeIn();
  });

  // GNB menu 클릭시 overlaps 쿠키저장
  //navber(pc 상단메뉴)
  $("#gnbNavbar .inner > ul li").on("click", function () {
    set_cookie("menuCode", $(this).data("overlaps") || 0, 1);
  });
  //navber sub (pc 상단메뉴 하위)
  $("#gnbNavbar ul li .sub li").on("click", function () {
    set_cookie("menuCode", $(this).closest("li").data("overlaps") || 0, 1);
  });
  //navber allmenu pop (pc 올메뉴 상단)
  $("#headerAllMenuPopup .ll-menu-content > ul li").on("click", function () {
    set_cookie("menuCode", $(this).data("overlaps") || 0, 1);
  });
  //navber allmenu pop sub (pc 올메뉴 하위)
  $("#headerAllMenuPopup .ll-menu-content > ul li ul li").on("click", function () {
    set_cookie("menuCode", $(this).closest("li").data("overlaps") || 0, 1);
  });
  //sidebar (pc 사이드메뉴)
  $(".sidebar .sidebar_nav .nav_sub .sub_list a").on("click", function () {
    set_cookie("menuCode", $(this).closest(".nav_sub").prev(".nav_main").data("overlaps") || 0, 1);
  });

  /* -----------------------------------------------------------
  ------ mobile ------
  --------------------------------------------------------------  */
  //topbanner button
  $(document).on("click", "#btnTopBannerClose", function (e) {
    e.preventDefault();
    $("#mobileHeaderWrap").removeClass("top-banner-on");
    $("#topBanner").addClass("none");
    set_cookie("banner_main_top", "close", 1);
  });

  //bottombanner
  // $(document).on("click", "#btnBottomBannerClose", function () {
  //   $(".bottomBanner").animate({ bottom: "-100%" }, 800);
  //   set_cookie("bottom_banner", "close", 1);
  // });

  // mobile GNB menu 클릭시 overlaps 쿠키저장
  // navBar (모바일 상단메뉴)
  $("#navBar .sub-navbar-wrap ul li").on("click", function () {
    set_cookie("menuCode", $(this).data("overlaps") || 0, 1);
  });
  //subnavBar (모바일 상단메뉴 하위)
  $("#navBar .deps2 ul li").on("click", function () {
    set_cookie("menuCode", $(this).data("overlaps") || 0, 1);
  });
  //sidebar (모바일 사이드메뉴)
  $("#mw_side .mw_side_menu .board a").on("click", function () {
    set_cookie("menuCode", $(this).closest(".board").prev(".group").data("overlaps") || 0, 1);
  });

  /* 검색 popup */
  $("#btnMobileSearchBar").on("click", function () {
    $(".search_popup").fadeIn();
    $(".us_stx input").focus();
  });

  $(".search_popup .search_box .return").on("click", function () {
    $(".search_popup").fadeOut();
  });

  // board menu (sub menu ) swiper
  initSwiper("#navSwiper", 10, true);
  initSwiper(".subNavSwiperDeps2", 20);
  initSwiper(".subNavSwiperDeps3", 10);
  initSwiper(".subNavSwiperDeps4", 10);

  //게시글 전체보기 페이지(scrap_articles / write_articles) 카테고리 swiper
  initSwiper(".historyPageTabSwiper", 0);
  initSwiper(".historyPageSwiper", 10);

  //ingre skin - 식단보조제 제조사별 검색필터
  if ($(".ingreCompanySearchTab").length) {
    initSwiper(".ingreCompanySearchTab", 4);
  }

  /**
   * 글쓰기 버튼 강조효과 표시
   */
  function showHighlightWriteButton() {
    const isMobile = $("body").hasClass("mobile");
    if (isMobile) {
      const STORAGE_KEY = "forum.highlightWriteButton";
      const existsSession = !!sessionStorage.getItem(STORAGE_KEY);

      if (!existsSession) {
        $("#highlightWriteButton").addClass("first");
        sessionStorage.setItem(STORAGE_KEY, true);
      }
    }
  }

  // 하단배너
  $(".new_bottom_banner").show();

  const bannerMainBottomKey = $(".new_bottom_banner .exit").data("key");

  $(".new_bottom_banner .exit").click(function () {
    if (bannerMainBottomKey == "popular") {
      $(".new_bottom_banner").animate({ bottom: "-80vw" }, 500, function () {
        showHighlightWriteButton();
        set_cookie("bottom_banner_close", bannerMainBottomKey, 1);
      });
    } else {
      history.back();
    }
  });

  if (get_cookie("bottom_banner_close") == "popular") {
    $(".new_bottom_banner").hide();
    showHighlightWriteButton();
  } else {
    $(".new_bottom_banner").show();
  }

  if ($(".new_bottom_banner").size() === 0) {
    showHighlightWriteButton();
  }

  function initSwiper(swiper, spaceBetween = 10, isAnimation = false) {
    if (!$(swiper).length) return;
    const activeIndex = $(swiper).find(".swiper-slide.on").index();
    const initialSlide = isAnimation ? (activeIndex > 0 ? activeIndex - 3 : 0) : activeIndex;
    new Swiper(swiper, {
      spaceBetween,
      slidesPerView: "auto",
      centeredSlides: false,
      freeMode: true,
      initialSlide,
      on: {
        init: function () {
          const thisSwiper = this;
          if (isAnimation) {
            setTimeout(function () {
              thisSwiper.slideTo(activeIndex, 800);
            }, 500);
          }
        },
      },
    });
  }

  // 모바일 메인 페이지 퀵메뉴 팝업
  $("#mainNavMenuWrap .btnOpenQuickMenu").click(function () {
    $("#navQuickMenuPopup").addClass("open");
  });

  $("#mainNavMenuWrap .btnCloseQuickMenu").click(function () {
    $("#navQuickMenuPopup").removeClass("open");
  });
});
