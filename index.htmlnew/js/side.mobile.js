var mw_side_toggle = false;

$(function () {
  $("#mw_toggle_button").click(function () {
    if (mw_side_toggle) {
      mw_side_off();
    } else {
      mw_side_on();
    }
  });

  $("#mw_side_close").click(function () {
    $("#mw_toggle_button").click();
  });

  $("#mw_modal_mask").click(function () {
    $("#mw_toggle_button").click();
  });

  $(".mw_side_menu .group").click(function () {
    var gr_id = $(this).attr("id").split("-")[1];
    $("#board-" + gr_id).toggle("500");
    if ($(this).find("span").hasClass("active")) {
      $(this).find("span").removeClass("active");
    } else {
      $(this).find("span").addClass("active");
    }
  });

  $("#mw_side_alarm").click(function () {
    location.href = "/new/plugin/smart-alarm/";
  });

  $(".mw_side_profile .mw_side_name .nickname .nick_toggle").click(function () {
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
      $(".mw_side_status_wrap").stop().animate({ height: 0 }, 200);
    } else {
      $(this).addClass("active");
      $(".mw_side_status_wrap").stop().animate({ height: "140px" }, 300);
    }
  });

  // 카카오톡으로 시작하기
  $(".btn-kakao-join").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    window.location.href = `/new/oauth/kakao.php?action=login`;
  });

  // LINE으로 시작하기
  $(".btn-line-join").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    window.location.href = `/new/oauth/line.php?action=login`;
  });
});

function mw_side_on() {
  mw_modal();

  $("html").addClass("not_scroll");
  $("#mw_side").css({ top: 0 });
  $("#mw_side").animate({ right: "0px" }, "slow");
  $("#mw_side_button").css("display", "none");

  document.ontouchmove = function (e) {
    if (!$("#mw_side").has($(e.target)).length) {
      e.preventDefault();
    }
  };

  mw_side_toggle = true;
}

function mw_side_off() {
  $("html").removeClass("not_scroll");
  $("#mw_side").animate({ right: "-100vw" }, "fast");
  $("#mw_side_button").css("display", "block");

  $(".mw_side_profile .mw_side_name .nickname .nick_toggle").removeClass("active");
  $(".mw_side_status_wrap").stop().animate({ height: 0 }, 200);

  mw_modal_close();

  document.ontouchmove = function (e) {
    return true;
  };

  $(".mw_side_menu .board").css("display", "none");
  $(".mw_side_menu .group span").removeClass("active");

  mw_side_toggle = false;
}

function mw_modal() {
  $("#mw_modal_mask").show();

  $(window).one("resize", function () {
    mw_modal();
  });
}

function mw_modal_close() {
  $("#mw_modal_mask").hide();
  $(window).unbind("resize");
}

$(window).bind("load scroll resize", function () {
  $("#mw_side_button").css("top", window.innerHeight - $("#mw_side_button").outerHeight() - 10);
});

// 쪽지 창
function win_memo(url) {
  const langCode = window.g5_translate_lang ?? "ko";
  if (!url) url = g5_bbs_url + `/memo.php?is_mobile=1&hl=${langCode}`;

  window.open(url);
}

// 포인트 창
function win_point(url) {
  const langCode = window.g5_translate_lang ?? "ko";
  window.open(g5_bbs_url + `/point.php?is_mobile=1&hl=${langCode}`);
}

function win_banlist(url) {
  const langCode = window.g5_translate_lang ?? "ko";
  window.open(g5_bbs_url + `/block.php?is_mobile=1&hl=${langCode}`);
}

// 스크랩 창
function win_scrap(url) {
  const langCode = window.g5_translate_lang ?? "ko";
  if (!url) url = g5_bbs_url + `/scrap.php?is_mobile=1&hl=${langCode}`;

  window.open(url);
}
