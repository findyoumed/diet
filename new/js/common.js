$(function () {});

moment.locale(g5_translate_lang);

// i18n JSON 로드(비동기) 완료 후 fn 실행. 이미 resolved면 즉시 fire.
// $.i18n() 의존 코드는 이 헬퍼로 감싸 raw key 노출을 방지한다.
// g5_i18n_ready는 head.sub.php 인라인에서 정의되며, 본 헬퍼는 호출 시점에 그 값을 참조한다.
window.whenI18nReady = function (fn) {
  return window.g5_i18n_ready && window.g5_i18n_ready.done ? window.g5_i18n_ready.done(fn) : $(fn);
};

// ===== 원래 common.js 내용 시작 =====

// 전역 변수
var errmsg = "";
var errfld = null;

// 필드 검사
function check_field(fld, msg) {
  if ((fld.value = trim(fld.value)) == "") error_field(fld, msg);
  else clear_field(fld);
  return;
}

// 필드 오류 표시
function error_field(fld, msg) {
  if (msg != "") errmsg += msg + "\n";
  if (!errfld) errfld = fld;
  fld.style.background = "#BDDEF7";
}

// 필드를 깨끗하게
function clear_field(fld) {
  fld.style.background = "#FFFFFF";
}

function trim(s) {
  var t = "";
  var from_pos = (to_pos = 0);

  for (i = 0; i < s.length; i++) {
    if (s.charAt(i) == " ") continue;
    else {
      from_pos = i;
      break;
    }
  }

  for (i = s.length; i >= 0; i--) {
    if (s.charAt(i - 1) == " ") continue;
    else {
      to_pos = i;
      break;
    }
  }

  t = s.substring(from_pos, to_pos);
  //				alert(from_pos + ',' + to_pos + ',' + t+'.');
  return t;
}

// 자바스크립트로 PHP의 number_format 흉내를 냄
// 숫자에 , 를 출력
function number_format(data) {
  data = data.toString();
  var tmp = "";
  var number = "";
  var cutlen = 3;
  var comma = ",";
  var i;

  var sign = data.match(/^[\+\-]/);
  if (sign) {
    data = data.replace(/^[\+\-]/, "");
  }

  len = data.length;
  mod = len % cutlen;
  k = cutlen - mod;
  for (i = 0; i < data.length; i++) {
    number = number + data.charAt(i);

    if (i < data.length - 1) {
      k++;
      if (k % cutlen == 0) {
        number = number + comma;
        k = 0;
      }
    }
  }

  if (sign != null) number = sign + number;

  return number;
}

//글자수 제한   => 9+ 로 표기
function formatNumberWithLimit(n, maxDigits = 6, useComma = false) {
  const rawStr = n.toString().replace(/,/g, "");
  if (rawStr.length <= maxDigits) {
    return useComma ? Number(rawStr).toLocaleString() : rawStr;
  } else {
    const capped = "9".repeat(maxDigits);
    return useComma ? Number(capped).toLocaleString() + "+" : capped + "+";
  }
}

// 새 창
function popup_window(url, winname, opt) {
  window.open(url, winname, opt);
}

// 폼메일 창
function popup_formmail(url) {
  opt = "scrollbars=yes,width=417,height=385,top=10,left=20";
  popup_window(url, "wformmail", opt);
}

// 달력 창
function win_calendar(fld, cur_date, delimiter, opt) {
  if (!opt) opt = "left=50, top=50, width=240, height=230, scrollbars=0,status=0,resizable=0";
  window.open(g4_path + "/bbs/calendar.php?fld=" + fld + "&cur_date=" + cur_date + "&delimiter=" + delimiter, "winCalendar", opt);
}

// , 를 없앤다.
function no_comma(data) {
  var tmp = "";
  var comma = ",";
  var i;

  for (i = 0; i < data.length; i++) {
    if (data.charAt(i) != comma) tmp += data.charAt(i);
  }
  return tmp;
}

// 삭제 검사 확인
function del(href) {
  showModalConfirm($.i18n("common.alert.deleteConfirm")).then(function (result) {
    if (result === true) {
      del2(href);
    }
  });
}

function del2(href) {
  var iev = -1;
  if (navigator.appName == "Microsoft Internet Explorer") {
    var ua = navigator.userAgent;
    var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
    if (re.exec(ua) != null) iev = parseFloat(RegExp.$1);
  }

  // IE6 이하에서 한글깨짐 방지
  if (iev != -1 && iev < 7) {
    document.location.href = encodeURI(href);
  } else {
    document.location.href = href;
  }
}

// 쿠키 입력
function set_cookie(name, value, expirehours, domain) {
  var today = new Date();
  today.setTime(today.getTime() + 60 * 60 * 1000 * expirehours);
  document.cookie = name + "=" + escape(value) + "; path=/; expires=" + today.toGMTString() + ";";
  if (domain) {
    document.cookie += "domain=" + domain + ";";
  }
}

// 쿠키 얻음
function get_cookie(name) {
  var find_sw = false;
  var start, end;
  var i = 0;

  for (i = 0; i <= document.cookie.length; i++) {
    start = i;
    end = start + name.length;

    if (document.cookie.substring(start, end) == name) {
      find_sw = true;
      break;
    }
  }

  if (find_sw == true) {
    start = end + 1;
    end = document.cookie.indexOf(";", start);

    if (end < start) end = document.cookie.length;

    return unescape(document.cookie.substring(start, end));
  }
  return "";
}

// 쿠키 지움
function delete_cookie(name) {
  var today = new Date();

  today.setTime(today.getTime() - 1);
  var value = get_cookie(name);
  if (value != "") document.cookie = name + "=" + value + "; path=/; expires=" + today.toGMTString();
}

var last_id = null;
function menu(id) {
  if (id != last_id) {
    if (last_id != null) document.getElementById(last_id).style.display = "none";
    document.getElementById(id).style.display = "block";
    last_id = id;
  } else {
    document.getElementById(id).style.display = "none";
    last_id = null;
  }
}

function textarea_decrease(id, row) {
  if (document.getElementById(id).rows - row > 0) document.getElementById(id).rows -= row;
}

function textarea_original(id, row) {
  document.getElementById(id).rows = row;
}

function textarea_increase(id, row) {
  document.getElementById(id).rows += row;
}

// 글숫자 검사
function check_byte(content, target) {
  var i = 0;
  var cnt = 0;
  var ch = "";

  if (document.getElementById(content) && document.getElementById(target)) {
    var cont = document.getElementById(content).value;

    for (i = 0; i < cont.length; i++) {
      ch = cont.charAt(i);
      if (escape(ch).length > 4) {
        cnt += 2;
      } else {
        cnt += 1;
      }
    }
    // 숫자를 출력
    document.getElementById(target).innerHTML = cnt;
  }

  return cnt;
}

function check_byte2(content, target, mb_level, write_min) {
  var i = 0;
  var cnt = 0;
  var ch = "";

  if (document.getElementById(content) && document.getElementById(target)) {
    var cont = document.getElementById(content).value;

    for (i = 0; i < cont.length; i++) {
      ch = cont.charAt(i);
      if (escape(ch).length > 4) {
        cnt += 2;
      } else {
        cnt += 1;
      }
    }

    // 숫자를 출력
    document.getElementById(target).innerHTML = cnt;

    if (cnt >= write_min && mb_level > "2") {
      if (document.getElementById("danger")) {
        document.getElementById("danger").style.display = "none";
      }
    }
  }

  return cnt;
}

// 브라우저에서 오브젝트의 왼쪽 좌표
function get_left_pos(obj) {
  var parentObj = null;
  var clientObj = obj;
  //var left = obj.offsetLeft + document.body.clientLeft;
  var left = obj.offsetLeft;

  while ((parentObj = clientObj.offsetParent) != null) {
    left = left + parentObj.offsetLeft;
    clientObj = parentObj;
  }

  return left;
}

// 브라우저에서 오브젝트의 상단 좌표
function get_top_pos(obj) {
  var parentObj = null;
  var clientObj = obj;
  //var top = obj.offsetTop + document.body.clientTop;
  var top = obj.offsetTop;

  while ((parentObj = clientObj.offsetParent) != null) {
    top = top + parentObj.offsetTop;
    clientObj = parentObj;
  }

  return top;
}

function flash_movie(src, ids, width, height, wmode) {
  var wh = "";
  if (parseInt(width) && parseInt(height)) wh = " width='" + width + "' height='" + height + "' ";
  return (
    "<object classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0' " +
    wh +
    " id=" +
    ids +
    "><param name=wmode value=" +
    wmode +
    "><param name=movie value=" +
    src +
    "><param name=quality value=high><embed src=" +
    src +
    " quality=high wmode=" +
    wmode +
    " type='application/x-shockwave-flash' pluginspage='http://www.macromedia.com/shockwave/download/index.cgi?p1_prod_version=shockwaveflash' " +
    wh +
    "></embed></object>"
  );
}

function obj_movie(src, ids, width, height, autostart) {
  var wh = "";
  if (parseInt(width) && parseInt(height)) wh = " width='" + width + "' height='" + height + "' ";
  if (!autostart) autostart = false;
  return "<embed src='" + src + "' " + wh + " autostart='" + autostart + "'></embed>";
}

function doc_write(cont) {
  document.write(cont);
}

var win_password_lost = function (href) {
  window.open(href, "win_password_lost", "width=620,height=650,scrollbars=1");
};

/**
 * 포인트 창
 **/
var win_point = function (href) {
  var new_win = window.open(href, "win_point", "left=100,top=100,width=600, height=600, scrollbars=1");
  new_win.focus();
};

/**
 * 쪽지 창
 **/
var win_memo = function (href) {
  var new_win = window.open(href, "win_memo", "left=100,top=100,width=860,height=650,scrollbars=1");
  new_win.focus();
};

/**
 * 메일 창
 **/
var win_email = function (href) {
  var new_win = window.open(href, "win_email", "left=100,top=100,width=600,height=580,scrollbars=0");
  new_win.focus();
};

/**
 * 자기소개 창
 **/
var win_profile = function (href) {
  var new_win = window.open(href, "win_profile", "left=100,top=100,width=620,height=510,scrollbars=1");
  new_win.focus();
};

/**
 * 차단 창
 **/
var win_block = function (mb_id, name) {
  if (mb_id != "") {
    showModalConfirm($.i18n("common.confirm.block", name)).then(function (result) {
      if (result === true) {
        $.ajax({
          type: "post",
          url: g5_bbs_url + "/mb_block.php",
          data: "act=blk&blk_id=" + mb_id,
          success: function (data) {
            if (data == "ok") {
              showModalAlert($.i18n("common.alert.blocked")).then(function () {
                location.reload();
              });
            } else if (data == "exist") {
              showModalAlert($.i18n("common.alert.alreadyBlocked"));
            }
          },
        });
      }
    });
  }
};

/**
 * 차단해제 창
 **/
var win_block2 = function (mb_id, name) {
  if (mb_id != "") {
    showModalConfirm($.i18n("common.confirm.unblock", name)).then(function (result) {
      if (result === true) {
        $.ajax({
          type: "post",
          url: g5_bbs_url + "/mb_block.php",
          data: "act=blk_del&blk_id=" + mb_id,
          success: function (data) {
            if (data == "ok") {
              showModalAlert($.i18n("common.alert.unblocked")).then(function () {
                location.reload();
              });
            } else if (data == "wrong") {
              showModalAlert($.i18n("common.alert.invalidAccess"));
            } else if (data == "short") {
              showModalAlert($.i18n("common.alert.unblockNotYet"));
            }
          },
        });
      }
    });
  }
};

/**
 * 스크랩 창
 **/
var win_scrap = function (href) {
  var new_win = window.open(href, "win_scrap", "left=100,top=100,width=600,height=600,scrollbars=1");
  new_win.focus();
};

var win_banlist = function (href) {
  var new_win = window.open(href, "win_banlist", "left=100,top=100,width=600,height=600,scrollbars=1");
  new_win.focus();
};

/**
 * 홈페이지 창
 **/
var win_homepage = function (href) {
  var new_win = window.open(href, "win_homepage", "");
  new_win.focus();
};

/**
 * 우편번호 창
 **/
var win_zip = function (frm_name, frm_zip, frm_addr1, frm_addr2, frm_addr3, frm_jibeon) {
  if (typeof daum === "undefined") {
    showModalAlert($.i18n("common.alert.noDaumScript"));
    return false;
  }

  var zip_case = 1; //0이면 레이어, 1이면 페이지에 끼워 넣기, 2이면 새창

  var complete_fn = function (data) {
    // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

    // 각 주소의 노출 규칙에 따라 주소를 조합한다.
    // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
    var fullAddr = ""; // 최종 주소 변수
    var extraAddr = ""; // 조합형 주소 변수

    // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
    if (data.userSelectedType === "R") {
      // 사용자가 도로명 주소를 선택했을 경우
      fullAddr = data.roadAddress;
    } else {
      // 사용자가 지번 주소를 선택했을 경우(J)
      fullAddr = data.jibunAddress;
    }

    // 사용자가 선택한 주소가 도로명 타입일때 조합한다.
    if (data.userSelectedType === "R") {
      //법정동명이 있을 경우 추가한다.
      if (data.bname !== "") {
        extraAddr += data.bname;
      }
      // 건물명이 있을 경우 추가한다.
      if (data.buildingName !== "") {
        extraAddr += extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
      }
      // 조합형주소의 유무에 따라 양쪽에 괄호를 추가하여 최종 주소를 만든다.
      extraAddr = extraAddr !== "" ? " (" + extraAddr + ")" : "";
    }

    // 우편번호와 주소 정보를 해당 필드에 넣고, 커서를 상세주소 필드로 이동한다.
    var of = document[frm_name];

    of[frm_zip].value = data.zonecode;

    of[frm_addr1].value = fullAddr;
    of[frm_addr3].value = extraAddr;

    if (of[frm_jibeon] !== undefined) {
      of[frm_jibeon].value = data.userSelectedType;
    }

    of[frm_addr2].focus();
  };

  switch (zip_case) {
    case 1: //iframe을 이용하여 페이지에 끼워 넣기
      var daum_pape_id = "daum_juso_page" + frm_zip,
        element_wrap = document.getElementById(daum_pape_id),
        currentScroll = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
      if (element_wrap == null) {
        element_wrap = document.createElement("div");
        element_wrap.setAttribute("id", daum_pape_id);
        element_wrap.style.cssText = "display:none;border:1px solid;left:0;width:100%;height:300px;margin:5px 0;position:relative;-webkit-overflow-scrolling:touch;";
        element_wrap.innerHTML =
          '<img src="//i1.daumcdn.net/localimg/localimages/07/postcode/320/close.png" id="btnFoldWrap" style="cursor:pointer;position:absolute;right:0px;top:-21px;z-index:1" class="close_daum_juso" alt="접기 버튼">';
        jQuery('form[name="' + frm_name + '"]')
          .find('input[name="' + frm_addr1 + '"]')
          .before(element_wrap);
        jQuery("#" + daum_pape_id)
          .off("click", ".close_daum_juso")
          .on("click", ".close_daum_juso", function (e) {
            e.preventDefault();
            jQuery(this).parent().hide();
          });
      }

      new daum.Postcode({
        oncomplete: function (data) {
          complete_fn(data);
          // iframe을 넣은 element를 안보이게 한다.
          element_wrap.style.display = "none";
          // 우편번호 찾기 화면이 보이기 이전으로 scroll 위치를 되돌린다.
          document.body.scrollTop = currentScroll;
        },
        // 우편번호 찾기 화면 크기가 조정되었을때 실행할 코드를 작성하는 부분.
        // iframe을 넣은 element의 높이값을 조정한다.
        onresize: function (size) {
          element_wrap.style.height = size.height + "px";
        },
        width: "100%",
        height: "100%",
      }).embed(element_wrap);

      // iframe을 넣은 element를 보이게 한다.
      element_wrap.style.display = "block";
      break;
    case 2: //새창으로 띄우기
      new daum.Postcode({
        oncomplete: function (data) {
          complete_fn(data);
        },
      }).open();
      break;
    default:
      //iframe을 이용하여 레이어 띄우기
      var rayer_id = "daum_juso_rayer" + frm_zip,
        element_layer = document.getElementById(rayer_id);
      if (element_layer == null) {
        element_layer = document.createElement("div");
        element_layer.setAttribute("id", rayer_id);
        element_layer.style.cssText =
          "display:none;border:5px solid;position:fixed;width:300px;height:460px;left:50%;margin-left:-155px;top:50%;margin-top:-235px;overflow:hidden;-webkit-overflow-scrolling:touch;z-index:10000";
        element_layer.innerHTML =
          '<img src="//i1.daumcdn.net/localimg/localimages/07/postcode/320/close.png" id="btnCloseLayer" style="cursor:pointer;position:absolute;right:-3px;top:-3px;z-index:1" class="close_daum_juso" alt="닫기 버튼">';
        document.body.appendChild(element_layer);
        jQuery("#" + rayer_id)
          .off("click", ".close_daum_juso")
          .on("click", ".close_daum_juso", function (e) {
            e.preventDefault();
            jQuery(this).parent().hide();
          });
      }

      new daum.Postcode({
        oncomplete: function (data) {
          complete_fn(data);
          // iframe을 넣은 element를 안보이게 한다.
          element_layer.style.display = "none";
        },
        width: "100%",
        height: "100%",
      }).embed(element_layer);

      // iframe을 넣은 element를 보이게 한다.
      element_layer.style.display = "block";
  }
};

/**
 * 설문조사 결과
 **/
var win_poll = function (href) {
  var new_win = window.open(href, "win_poll", "width=616, height=500, scrollbars=1");
  new_win.focus();
};

/**
 * 스크린리더 미사용자를 위한 스크립트 - 지운아빠 2013-04-22
 * alt 값만 갖는 그래픽 링크에 마우스오버 시 title 값 부여, 마우스아웃 시 title 값 제거
 **/
$(function () {
  $("a img")
    .mouseover(function () {
      $a_img_title = $(this).attr("alt");
      $(this).attr("title", $a_img_title);
    })
    .mouseout(function () {
      $(this).attr("title", "");
    });
});

/**
 * 텍스트 리사이즈
 **/
function font_resize(id, rmv_class, add_class) {
  var $el = $("#" + id);

  $el.removeClass(rmv_class).addClass(add_class);

  set_cookie("ck_font_resize_rmv_class", rmv_class, 1, g5_cookie_domain);
  set_cookie("ck_font_resize_add_class", add_class, 1, g5_cookie_domain);
}

/**
 * 댓글 수정 토큰
 **/
function set_comment_token(f) {
  if (typeof f.token === "undefined") $(f).prepend('<input type="hidden" name="token" value="">');

  $.ajax({
    url: g5_bbs_url + "/ajax.comment_token.php",
    type: "GET",
    dataType: "json",
    async: false,
    cache: false,
    success: function (data, textStatus) {
      f.token.value = data.token;
    },
  });
}

$(function () {
  $(".win_point").click(function () {
    win_point(this.href);
    return false;
  });

  $(".win_memo").click(function () {
    win_memo(this.href);
    return false;
  });

  $(".win_email").click(function () {
    win_email(this.href);
    return false;
  });

  $(".win_scrap").click(function () {
    win_scrap(this.href);
    return false;
  });

  $(".win_banlist").click(function () {
    win_banlist(this.href);
    return false;
  });

  $(".win_profile").click(function () {
    win_profile(this.href);
    return false;
  });

  $(".win_homepage").click(function () {
    win_homepage(this.href);
    return false;
  });

  $(".win_password_lost").click(function () {
    win_password_lost(this.href);
    return false;
  });

  // 사이드뷰
  var sv_hide = false;

  $(document).on("click", ".sv_member, .sv_guest", function (e) {
    e.stopPropagation();

    $(".sv").removeClass("sv_on");
    $(this).closest(".sv_wrap").find(".sv").addClass("sv_on");
  });

  $(document).on("click", function (e) {
    $(".sv").removeClass("sv_on");
  });

  // 셀렉트 ul
  var sel_hide = false;
  $(".sel_btn").click(function () {
    $(".sel_ul").removeClass("sel_on");
    $(this).siblings(".sel_ul").addClass("sel_on");
  });

  $(".sel_wrap").hover(
    function () {
      sel_hide = false;
    },
    function () {
      sel_hide = true;
    },
  );

  $(".sel_a").focusin(function () {
    sel_hide = false;
  });

  $(".sel_a").focusout(function () {
    sel_hide = true;
  });

  $(document).click(function () {
    if (sv_hide) {
      // 사이드뷰 해제
      $(".sv").removeClass("sv_on");
    }
    if (sel_hide) {
      // 셀렉트 ul 해제
      $(".sel_ul").removeClass("sel_on");
    }
  });

  $(document).focusin(function () {
    if (sv_hide) {
      // 사이드뷰 해제
      $(".sv").removeClass("sv_on");
    }
    if (sel_hide) {
      // 셀렉트 ul 해제
      $(".sel_ul").removeClass("sel_on");
    }
  });

  $(document).on("keyup change", "textarea#wr_content[maxlength]", function () {
    var str = $(this).val();
    var mx = parseInt($(this).attr("maxlength"));
    if (str.length > mx) {
      $(this).val(str.substr(0, mx));
      return false;
    }
  });
});

function get_write_token(bo_table) {
  var token = "";

  $.ajax({
    type: "POST",
    url: g5_bbs_url + "/write_token.php",
    data: { bo_table: bo_table },
    cache: false,
    async: false,
    dataType: "json",
    success: function (data) {
      if (data.error) {
        showModalAlert(data.error);
        if (data.url) document.location.href = data.url;

        return false;
      }

      token = data.token;
    },
  });

  return token;
}

$(function () {
  $(document).on("click", "form[name=fwrite] input:submit, form[name=fwrite] button:submit", function () {
    var f = this.form;
    var bo_table = f.bo_table.value;
    var token = get_write_token(bo_table);

    if (!token) {
      showModalAlert($.i18n("common.alert.invalidToken"));
      return false;
    }

    var $f = $(f);

    if (typeof f.token === "undefined") $f.prepend('<input type="hidden" name="token" value="">');

    $f.find("input[name=token]").val(token);

    return true;
  });
});

// 상세 페이지 이동
var isDisabled = false;
function goDetail(url) {
  if (isDisabled) {
    return false;
  } else {
    isDisabled = true;
    url = url.replace("board.php", "board_v2.php");
    url = url.replace("write.php", "write_v2.php");
    window.open(url);
    setTimeout(function () {
      isDisabled = false;
    }, 1000);
  }
}

function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "ko",
      includedLanguages: "en,ja,ko,zh-CN,vi",
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
      multilanguagePage: true,
    },
    "google_translate_element",
  );
}

/**
 * 통합검색
 */
$(function () {
  const langPath = window.g5_translate_path ?? "";
  var $form = $('form[name="unitedSearchForm"]');
  var $input = $('input[name="stx"]', $form);

  function searchData() {
    if ($input.val() == null || $input.val() == "") {
      showModalAlert($.i18n("common.search.placeholder.required"));
      return false;
    } else if ($input.val().trim().length < 2) {
      showModalAlert($.i18n("common.search.error.minLength"));
      return false;
    }

    window.location.href = `${langPath}/search/${$input.val().trim()}`;
  }

  $input.off("keyup").on("keyup", function (e) {
    if (e.keyCode == 13) {
      return searchData();
    }
  });

  $form.off("submit").on("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    searchData();
    return false;
  });
});

/**
 * AppleID 로그인 초기화
 * @returns
 */
function prepareAppleID($button = null) {
  if (!$button || $button.size() == 0) {
    throw new Error($.i18n("common.error.noAppleButton"));
  }

  const { client_id, state } = $button.data();

  if (!client_id || !state) {
    throw new Error($.i18n("common.error.noAppleConfig"));
  }

  const d = new $.Deferred();
  const scriptUrl = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

  if (window._initAppleID === true) {
    d.resolve();
  } else {
    $.getScript(scriptUrl, function () {
      if (window.AppleID && window.AppleID.auth && window.AppleID.auth.init) {
        window._initAppleID = true;
        window.AppleID.auth.init({
          clientId: client_id,
          scope: "name email",
          state: state,
          redirectURI: `https://${window.location.hostname}/new/oauth/apple.php`,
          usePopup: true,
        });

        d.resolve();
      }
    }).fail(function (jqxhr, settings, exception) {
      console.error(`${scriptUrl} 스크립트 로드 중 오류 발생:`, exception);
    });
  }

  return d.promise();
}

/**
 * reCAPTCHA 스크립트 초기화
 * @returns
 */
function prepareCaptchaScript($wrapper = null, callbackFunc = null) {
  if (!$wrapper || $wrapper.size() == 0) {
    throw new Error($.i18n("common.error.noRecaptchaUi"));
  }

  const langCode = window.g5_translate_lang ?? "ko";
  const { recaptcha_key } = $wrapper.data();

  if (!recaptcha_key) {
    throw new Error($.i18n("common.error.noRecaptchaConfig"));
  }

  const d = new $.Deferred();
  const scriptUrl = `https://www.google.com/recaptcha/api.js?onload=onCaptchaCallback&render=explicit&hl=${langCode}`;

  if (window._initCaptcha === true) {
    d.resolve();
  } else {
    window.onCaptchaCallback = function () {
      const UI_WIDTH = 304;
      const UI_HEIGHT = 78;

      const scale = Math.max(1, $wrapper.width() / UI_WIDTH);

      $wrapper.css({ height: `${Math.ceil(UI_HEIGHT * scale)}px`, transformOrigin: "0 0", transform: `scale(${scale})` });

      grecaptcha.render("reCAPTCHA", {
        sitekey: recaptcha_key,
        callback: function (token) {
          if (typeof callbackFunc == "function") {
            callbackFunc.call(this, token);
          }
        },
      });
    };

    $.getScript(scriptUrl, function () {
      if (window.grecaptcha && window.grecaptcha.render) {
        window._initCaptcha = true;

        d.resolve();
      }
    }).fail(function (jqxhr, settings, exception) {
      console.error(`${scriptUrl} 스크립트 로드 중 오류 발생:`, exception);
    });
  }

  return d.promise();
}

/**
 * 네이버 스마트에디터 스크립트 초기화
 * @param {*} $wrapper
 * @returns
 */
function prepareSmartEditor($wrapper) {
  if (!$wrapper || $wrapper.size() == 0) {
    throw new Error("SmartEditor initialize failed!");
  }

  const langCode = window.g5_translate_lang ?? "ko";
  const isMobile = $("body").hasClass("mobile");

  const localePresets = {
    ko: {
      langCode: "ko_KR",
    },
    ja: {
      langCode: "ja_JP",
      fonts: [
        ["MS UI Gothic", "MS UI Gothic"],
        ["MS Pゴシック", "MS Pゴシック"],
        ["MS ゴシック", "MS ゴシック"],
        ["MS P明朝", "MS P明朝"],
        ["MS 明朝", "MS 明朝"],
        ["Arial", "Arial"],
        ["Arial Black", "Arial Black"],
        ["Comic Sans MS", "Comic Sans MS"],
        ["Courier New", "Courier New"],
        ["Times New Roman", "Times New Roman"],
        ["Verdana", "Verdana"],
      ],
    },
    en: {
      langCode: "en_US",
      fonts: [
        ["Gulim", "Gulim"],
        ["Batang", "Batang"],
        ["Gulimche", "Gulimche"],
        ["Sans Serif", "Sans Serif"],
        ["Serif", "Serif"],
        ["Wide", "Wide"],
        ["Narrow", "Narrow"],
        ["Comic Sans MS", "Comic Sans MS"],
        ["Courier New", "Courier New"],
        ["Garamond", "Garamond"],
        ["Georgia", "Georgia"],
        ["Tahoma", "Tahoma"],
        ["Trebuchet MS", "Trebuchet MS"],
        ["Verdana", "Verdana"],
      ],
    },
    "zh-CN": {
      langCode: "zh_CN",
      fonts: [
        ["宋体", "宋体"],
        ["新宋体", "新宋体"],
        ["黑体", "黑体"],
        ["仿宋", "仿宋"],
        ["楷体", "楷体"],
        ["幼圆", "幼圆"],
        ["隶书", "隶书"],
        ["华文彩云", "华文彩云"],
        ["Arial", "Arial"],
        ["Comic Sans MS", "Comic Sans MS"],
        ["Verdana", "Verdana"],
        ["Times New Roman", "Times New Roman"],
        ["Tahoma", "Tahoma"],
      ],
    },
  };

  const localeCode = localePresets[langCode]?.langCode ?? "ko_KR";

  const d = new $.Deferred();
  const scriptUrl = "/new/plugin/editor/smarteditor2/js/service/HuskyEZCreator.js";

  if (window._initSmartEditor === true) {
    d.resolve();
  } else {
    let smartEditor = [];

    // "단축키 일람" 버튼 추가
    $wrapper.before(`<div class="cke_sc"><button type="button" class="btn_cke_sc">${$.i18n("common.editor.shortcuts.button")}</button></div>`);

    // "단축키 일람" 버튼 클릭
    $(document).on("click", ".btn_cke_sc", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if ($(this).next("div.cke_sc_def").length) {
        $(this).next("div.cke_sc_def").remove();
        $(this).text($.i18n("common.editor.shortcuts.button"));
      } else {
        $(this).after("<div class='cke_sc_def' />").next("div.cke_sc_def").append(`
        <dl>
          <dt>CTRL+B</dt>
          <dd>${$.i18n("common.editor.shortcuts.bold")}</dd>
          <dt>CTRL+U</dt>
          <dd>${$.i18n("common.editor.shortcuts.underline")}</dd>
          <dt>CTRL+I</dt>
          <dd>${$.i18n("common.editor.shortcuts.italic")}</dd>
          <dt>CTRL+D</dt>
          <dd>${$.i18n("common.editor.shortcuts.strike")}</dd>
          <dt>TAB</dt>
          <dd>${$.i18n("common.editor.shortcuts.indent")}</dd>
          <dt>SHIFT+TAB</dt>
          <dd>${$.i18n("common.editor.shortcuts.outdent")}</dd>
          <dt>CTRL+K</dt>
          <dd>${$.i18n("common.editor.shortcuts.link")}</dd>
          <dt>CTRL+F</dt>
          <dd>${$.i18n("common.editor.shortcuts.find")}</dd>
          <dt>CTRL+H</dt>
          <dd>${$.i18n("common.editor.shortcuts.replace")}</dd>
          <dt>CTRL+A</dt>
          <dd>${$.i18n("common.editor.shortcuts.selectAll")}</dd>
      </dl>
      <button type="button" class="btn_cke_sc_close">${$.i18n("common.text.window")}</button>`);
        $(this).text($.i18n("common.editor.shortcuts.close"));
      }
    });

    // "단축키 일람" 닫기 버튼 클릭
    $(document).on("click", ".btn_cke_sc_close", function () {
      $(this).parent("div.cke_sc_def").remove();
    });

    $.getScript(scriptUrl, function () {
      if (window.nhn?.husky?.EZCreator?.createInIFrame) {
        const wrapperId = $wrapper.attr("id");

        nhn.husky.EZCreator.createInIFrame({
          oAppRef: smartEditor,
          elPlaceHolder: wrapperId,
          sSkinURI: `/new/plugin/editor/smarteditor2/SmartEditor2Skin_${localeCode}.html?isMobile=${isMobile}`,
          htParams: {
            bUseToolbar: true, // 툴바 사용 여부 (true:사용/ false:사용하지 않음)
            bUseVerticalResizer: !isMobile, // 입력창 크기 조절바 사용 여부 (true:사용/ false:사용하지 않음)
            bUseModeChanger: true, // 모드 탭(Editor | HTML | TEXT) 사용 여부 (true:사용/ false:사용하지 않음)
            bSkipXssFilter: true, // client-side xss filter 무시 여부 (true:사용하지 않음 / 그외:사용)
            sLang: localeCode,
            I18N_LOCALE: localeCode,
            SE2M_FontName: {
              ...(localePresets[langCode]?.fonts ? { aDefaultFontList: localePresets[langCode].fonts } : {}),
            },
            fOnBeforeUnload: function () {},
          },
          fOnAppLoad: function () {
            if (smartEditor.getById && smartEditor.getById[wrapperId]) {
              smartEditor.getById[wrapperId].exec("LOAD_CONTENTS_FIELD");

              // placeholder 오버레이 설정
              setupSmartEditorPlaceholder($wrapper);

              // 스마트에디터 초기화 이벤트 발생
              $(window).trigger("onSmartEditorReady", smartEditor);
            }
          },
          fCreator: "createSEditor2",
        });

        window._initSmartEditor = true;
        window._smartEditor = smartEditor;
        window.ed_nonce = $wrapper.data("nonce");

        d.resolve();
      }
    }).fail(function (jqxhr, settings, exception) {
      console.error(`${scriptUrl} 스크립트 로드 중 오류 발생:`, exception);
    });
  }

  return d.promise();
}

/**
 * 네이버 스마트에디터 내용을 textarea 필드값에 설정
 * @param {*} $wrapper
 * @returns
 */
function updateSmartEditorContentField($wrapper) {
  if (!$wrapper || $wrapper.size() == 0) {
    return "";
  }

  const wrapperId = $wrapper.attr("id");
  const smartEditor = window._smartEditor && window._smartEditor.getById ? window._smartEditor.getById[wrapperId] : null;

  if (!smartEditor) return "";

  smartEditor.exec("UPDATE_CONTENTS_FIELD");

  const html = smartEditor.getIR();

  return ["<p></p>", "<br>", ""].includes(html) ? "" : html;
}

/**
 * 네이버 스마트에디터 내용 변경하기
 * @param {*} $wrapper
 * @param {*} html
 * @returns
 */
function setSmartEditorContent($wrapper, html) {
  if (!$wrapper || $wrapper.size() == 0) {
    return;
  }

  $wrapper.val(html);

  const wrapperId = $wrapper.attr("id");
  const smartEditor = window._smartEditor && window._smartEditor.getById ? window._smartEditor.getById[wrapperId] : null;

  if (!smartEditor) return;

  smartEditor.exec("LOAD_CONTENTS_FIELD");

  if (typeof $wrapper.data("refreshSePlaceholder") === "function") {
    $wrapper.data("refreshSePlaceholder")();
  }
}

/**
 * 스마트에디터 iframe 내부 편집영역에 placeholder 요소 삽입
 * @param {*} $wrapper
 */
function setupSmartEditorPlaceholder($wrapper) {
  const placeholder = $wrapper.attr("placeholder") || $wrapper.data("placeholder");
  if (!placeholder) return;

  const $outerFrame = $wrapper.nextAll("iframe").first();
  if ($outerFrame.length === 0) return;

  const STYLE_ID = "smarteditor2-placeholder-style";
  const EMPTY_CLASS = "se-placeholder-empty";

  const $innerFrame = () => {
    try {
      return $outerFrame.contents().find("#se2_iframe");
    } catch (e) {
      return $();
    }
  };

  const $innerBody = () => {
    try {
      const $inner = $innerFrame();
      return $inner.length ? $inner.contents().find("body.se2_inputarea") : $();
    } catch (e) {
      return $();
    }
  };

  const injectStyle = () => {
    const $inner = $innerFrame();
    if ($inner.length === 0) return;

    const $innerDoc = $inner.contents();
    if ($innerDoc.find("#" + STYLE_ID).length > 0) return;

    const $target = $innerDoc.find("head").length ? $innerDoc.find("head") : $innerDoc.find("html");
    if ($target.length === 0) return;

    //css iframe 내부로 load
    $target.append(
      $("<link>", {
        id: STYLE_ID,
        rel: "stylesheet",
        type: "text/css",
        href: (window.g5_url || "") + "/css/board/board_write_form.inc.css",
      }),
    );
  };

  const isBodyEmpty = ($body) => {
    if ($body.length === 0) return false;

    const text = ($body.text() || "").replace(/ /g, "").trim();
    if (text !== "") return false;

    const html = ($body.html() || "").replace(/\s+/g, "").toLowerCase();
    return ["", "<p></p>", "<p><br></p>", "<br>", "<p>&nbsp;</p>"].includes(html);
  };

  const refresh = () => {
    const $body = $innerBody();
    if ($body.length === 0) return;
    $body.toggleClass(EMPTY_CLASS, isBodyEmpty($body));
  };

  const setup = () => {
    const $body = $innerBody();
    if ($body.length === 0) return false;

    injectStyle();
    $body.attr("data-se-placeholder", placeholder);

    $body.off(".sePlaceholder");
    $body.on("input.sePlaceholder keyup.sePlaceholder blur.sePlaceholder focus.sePlaceholder compositionend.sePlaceholder", refresh);

    refresh();
    return true;
  };

  const attachInnerLoad = () => {
    $innerFrame().off("load.sePlaceholder").on("load.sePlaceholder", setup);
  };

  $outerFrame.on("load.sePlaceholder", attachInnerLoad);
  attachInnerLoad();

  if (!setup()) {
    let tries = 50;
    const poll = setInterval(() => {
      if (setup() || --tries <= 0) clearInterval(poll);
    }, 100);
  }

  $wrapper.data("refreshSePlaceholder", refresh);
}

/**
 * 로딩 오버레이 표시
 */
function showLoadingOverlay() {
  $.LoadingOverlay("show", {
    image: "",
    background: "rgba(255,255,255,0.4)",
    fontawesome: "fa fa-spinner fa-spin",
  });
}

/**
 * 로딩 오버레이 숨기기
 */
function hideLoadingOverlay() {
  $.LoadingOverlay("hide");
}

/**
 * 숫자 표기형식이 적용된 문자열 가져오기
 * @param {*} value
 * @returns
 */
function formattedNumber(value) {
  if (value === null || isNaN(value) || value === 0) {
    return 0;
  } else {
    let formatted;

    const number = Math.abs(value);
    const fixed = number % 1 !== 0 ? 2 : 0;

    formatted = number.toFixed(fixed).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,");

    if (value < 0) {
      formatted = "-" + formatted;
    }

    return formatted;
  }
}

/**
 * 줄바꿈 개행문자열을 br 태그로 변환
 * @param {*} value
 * @returns
 */
function nl2br(value) {
  if ((value ?? "") === "") return "";

  return value.replaceAll("\\r\\n", "<br />").replaceAll("\\n", "<br />").replaceAll("\r\n", "<br />").replaceAll("\n", "<br />");
}

/**
 * 줄바꿈 개행문자열이 여러개 반복되는 경우 간소화처리
 * @param {*} value
 * @returns
 */
function normalizeNewLines(value) {
  if (!value) return "";

  return value
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !!line)
    .join("\n");
}

/**
 * 클립보드에 복사하기
 * @param {*} text
 * @returns
 */
async function copyToClipboard(text) {
  let success = false;

  try {
    await navigator.clipboard.writeText(text);
    success = true;
  } catch (e) {
    console.error(e);
  }

  if (!success) {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    textarea.value = text;
    textarea.select();

    document.execCommand("copy");
    document.body.removeChild(textarea);

    success = true;
  }

  return success;
}
