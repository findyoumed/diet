$(function () {
  // input.textOnlyNumber 숫자만 입력가능 폼
  $(document).on("keyup blur", ".textOnlyNumber", function () {
    $(this).val(
      $(this)
        .val()
        .replace(/[^0-9]/g, "")
    );
  });

  //input.telPhoneNumber 숫자만 입력가능 폼 + 전화번호 - 자동입력
  $(document).on("keyup", ".telPhoneNumber", function () {
    $(this).val(
      $(this)
        .val()
        .replace(/[^0-9]/g, "")
        .replace(/(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/, "$1-$2-$3")
        .replace("--", "-")
    );
  });

  /**
   * nice select selected 클래스 추가 ( 포인트 컬러 )
   *  nice-select(.activeColor) focus class
   */
  $(document).on("change", ".common-select-box.activeColor", function () {
    if ($(this).val() !== "") {
      $(this).addClass("selected").next(".common-select-box.activeColor").addClass("selected");
    } else {
      $(this).removeClass("selected").next(".common-select-box.activeColor").removeClass("selected");
    }
  });

  /**
   * input[type='file'] 중 이미지 파일만 허용
   */
  $(document).on("change", "input[type='file']", function () {
    const isImageFileInput = $(this).attr("accept") && $(this).attr("accept").includes("image");
    if (!isImageFileInput) {
      return;
    }
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp"];
    const fileName = $(this).val().split("\\").pop();
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (fileName != "" && !allowedExtensions.includes(fileExtension)) {
      alert(`${allowedExtensions.join(", ")} 파일만 허용됩니다.`);
      $(this).val("");
    }
  });

  // --- 아이디 | 비밀번호 입력 .common-user-login-form (focus, blur, delete 버튼 등) ----
  const $loginFormDivs = $(".common-user-login-form > div");

  $loginFormDivs.on("focusin", function () {
    const $this = $(this);
    const $input = $this.find("input");

    if ($this.hasClass("readonly")) {
      return;
    }

    $loginFormDivs.find(".icon").removeClass("active on");
    $loginFormDivs.find(".btn-delete").hide();

    if ($this.find(".btn-delete").length === 0) {
      $this.append(`<span class="btn-delete"></span>`);
    }

    $this.find(".icon").addClass("active on");

    if ($input && $input.size() && $input.val().trim() !== "") {
      $this.find(".btn-delete").show();
    }
  });

  $(".common-user-login-form div:not(.readonly) input").on("focusout", function () {
    $(this).closest("div").find(".icon").removeClass("active on");
  });

  $loginFormDivs.find("input").on("keyup", function () {
    const $input = $(this);
    const $deleteBtn = $input.closest("div").find(".btn-delete");

    if ($input.val().trim() !== "") {
      $deleteBtn.show();
    } else {
      $deleteBtn.hide();
    }
  });

  $(document).on("click", ".common-user-login-form .btn-delete", function () {
    $(this).parent("div").find("input").val("");
    $(this).hide();
  });
  // --- 아이디 | 비밀번호 입력 .common-user-login-form (focus, blur, delete 버튼 등) ----

  /* datepicker 처리 */
  if ($.fn.datepicker && $(".common-datepicker").length > 0) {
    const langCode = window.g5_translate_lang ?? "ko";
    const datePickerRegional = {
      ko: {
        prevText: "이번 달",
        nextText: "다음 달",
        closeText: "닫기",

        monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
        monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],

        dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
        dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
        dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
      },
      ja: {
        prevText: "今月",
        nextText: "来月",
        closeText: "閉じる",

        monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        monthNamesShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],

        dayNames: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
        dayNamesMin: ["日", "月", "火", "水", "木", "金", "土"],
        dayNamesShort: ["日", "月", "火", "水", "木", "金", "土"],
      },
      en: {
        prevText: "This Month",
        nextText: "Next Month",
        closeText: "Close",

        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      },
      "zh-CN": {
        prevText: "本月",
        nextText: "下月",
        closeText: "关闭",

        monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        monthNamesShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],

        dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
        dayNamesShort: ["日", "一", "二", "三", "四", "五", "六"],
      },
    };

    $(".common-datepicker").datepicker(
      Object.assign(
        {
          dateFormat: "yymmdd",
          yearRange: "c-99:c+99",

          changeMonth: true,
          changeYear: true,
          showMonthAfterYear: true,
        },
        datePickerRegional[langCode]
      )
    );
  }
});
