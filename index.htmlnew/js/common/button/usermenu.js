$(function () {
  const langCode = window.g5_translate_lang ?? "ko";
  const langPath = window.g5_translate_path ?? "";


  const $body = $("body");
  const IS_ADMIN = (window.g5_is_admin ?? "") !== "";

  /**
   * 드롭다운 메뉴 토글
   * @param {*} $button
   */
  function toggleDropdownMenu($button) {
    const bo_table = $button.data("bo_table") ?? "";
    const wr_id = $button.data("wr_id") ?? 0;
    const wr_parent = $button.data("wr_parent") ?? 0;
    const mb_id = $button.data("mb_id") ?? "";
    const wr_name = $button.data("wr_name") ?? "";
    const enc_mb_id = $button.data("enc_mb_id") ?? "";
    const nickhide = $button.data("nickhide"); //-> true일경우 admin에서만 user버튼 노출

    if (mb_id && wr_name && $(".usermenu-dropdown", $button).size() === 0 && (IS_ADMIN || !nickhide)) {
      $(".usermenu-dropdown", $body).remove();

      const buttons = [];

      if (window.g5_mb_id && window.g5_mb_id !== mb_id && enc_mb_id) {
        buttons.push(`
          <button type="button"
                  class="btn_send_memo"
                  title="${$.i18n("common.button.sendMemo")}"
          >
            <i class="fa fa-paper-plane-o"></i> ${$.i18n("common.button.sendMemo")}
          </button>
        `);

        buttons.push(`
          <button type="button"
                  class="btn_profile"
                  title="${$.i18n("common.button.showProfile")}"
          >
            <i class="fa fa-user"></i> ${$.i18n("common.button.showProfile")}
          </button>
        `);
      }

      if (bo_table && enc_mb_id) {
        buttons.push(`
          <button type="button"
                  class="btn_search_articles"
                  title="${$.i18n("common.button.searchById")}"
          >
            <i class="fa fa-search"></i> ${$.i18n("common.button.searchById")}
          </button>
        `);
      }

      if (window.g5_mb_id && window.g5_mb_id !== mb_id) {
        if (bo_table && wr_id > 0) {
          buttons.push(`
            <button type="button"
                    class="btn_comment_report"
                    title="${$.i18n("common.text.report")}"
            >
              <i class="fa fa-exclamation-triangle"></i> ${$.i18n("common.text.report")}
            </button>
          `);
        }

        buttons.push(`
          <button type="button"
                  class="btn_ban_user"
                  title="${$.i18n("common.button.blockUser")}"
          >
            <i class="fa fa-ban"></i> ${$.i18n("common.button.blockUser")}
          </button>
        `);
      }

      if (enc_mb_id) {
        buttons.push(`
          <button type="button"
                  class="btn_user_writes"
                  title="${$.i18n("common.button.searchAll")}"
                  data-mb_id="${enc_mb_id}"
          >
            <i class="fa fa-database"></i> ${$.i18n("common.button.searchAll")}
          </button>
        `);
      }

      if (IS_ADMIN) {
        buttons.push(`
          <button type="button"
                  class="btn_admin_user_info"
                  title="회원정보변경"
          >
            <i class="fa fa-cog"></i> 회원정보변경
          </button>
        `);

        buttons.push(`
          <button type="button"
                  class="btn_admin_user_points"
                  title="포인트내역"
          >
            <i class="fa fa-gift"></i> 포인트내역
          </button>
        `);
      }

      if (buttons.length > 0) {
        $button.append(`
          <div class="usermenu-dropdown"
               data-bo_table="${bo_table}"
               data-wr_id="${wr_id}"
               data-wr_parent="${wr_parent}"
               data-mb_id="${mb_id}"
               data-wr_name="${wr_name}"
               data-enc_mb_id="${enc_mb_id}"
          >
            ${buttons.join("")}
          </div>
        `);
      }
    } else {
      $(".usermenu-dropdown", $body).remove();
    }
  }

  // 드롭다운 메뉴 토글
  $body.on("click", ".btn_usermenu", function (e) {
    e.preventDefault();
    e.stopPropagation();

    toggleDropdownMenu($(this));
  });

  // 쪽지보내기
  $body.on("click", ".usermenu-dropdown .btn_send_memo", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $container = $(this).closest(".usermenu-dropdown");
    const { enc_mb_id } = $container.data();

    if (enc_mb_id) {
      const params = new URLSearchParams();
      params.set("kind", "write");
      params.set("me_recv_mb_id", enc_mb_id);

      if (langCode && langCode !== "ko") {
        params.set("hl", langCode);
      }

      window.open(`/new/bbs/memo.php?${params.toString()}`, "memo_popup", "width=860,height=650");
    }
  });

  // 자기소개
  $body.on("click", ".usermenu-dropdown .btn_profile", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $container = $(this).closest(".usermenu-dropdown");
    const { enc_mb_id } = $container.data();

    if (enc_mb_id) {
      const params = new URLSearchParams();
      params.set("mb_id", enc_mb_id);

      if (langCode && langCode !== "ko") {
        params.set("hl", langCode);
      }

      window.open(`/new/bbs/profile.php?${params.toString()}`, "memo_popup", "width=620,height=520");
    }
  });

  // 작성자로 검색
  $body.on("click", ".usermenu-dropdown .btn_search_articles", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $container = $(this).closest(".usermenu-dropdown");
    const { bo_table, mb_id, enc_mb_id } = $container.data();

    if (bo_table && mb_id && enc_mb_id) {
      const params = new URLSearchParams();

      if (bo_table === "hairbnb") {
        params.set("sfl", "wr_subject||wr_content,30");
        params.set("stx", mb_id);

        window.location.href = `${langPath}/${bo_table}/list?${params.toString()}`;
      } else {
        params.set("sfl", "mb_id,1");
        params.set("stx", enc_mb_id);

        window.location.href = `${langPath}/${bo_table}?${params.toString()}`;
      }
    }
  });

  // 신고하기
  $body.on("click", ".usermenu-dropdown .btn_comment_report", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $container = $(this).closest(".usermenu-dropdown");
    const { bo_table, wr_id, wr_parent } = $container.data();

    if (bo_table && wr_id > 0) {
      const params = new URLSearchParams();
      params.set("bo_table", bo_table);
      params.set("wr_id", wr_id);

      if (wr_parent && wr_parent > 0) {
        params.set("wr_parent", wr_parent);
      }

      if (langCode && langCode !== "ko") {
        params.set("hl", langCode);
      }

      window.open(`/new/popup/board_report.php?${params.toString()}`, "report_popup", "width=500,height=450");
    }
  });

  // 차단하기
  $body.on("click", ".usermenu-dropdown .btn_ban_user", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $container = $(this).closest(".usermenu-dropdown");
    const { mb_id, wr_name } = $container.data();

    if (mb_id && wr_name) {
      showModalConfirm($.i18n("common.confirm.blockUser", wr_name)).then(function (result) {
        if (result === true) {
          $.post(
            "/new/bbs/mb_block.php",
            {
              act: "blk",
              blk_id: mb_id,
            },
            function (data) {
              if (data == "ok") {
                showModalAlert($.i18n("common.alert.blocked")).then(function () {
                  window.location.reload();
                });
              } else if (data == "exist") {
                showModalAlert($.i18n("common.alert.alreadyBlocked"));
              }
            }
          );
        }
      });
    }
  });

  // 전체게시물
  $body.on("click", ".usermenu-dropdown .btn_user_writes", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $container = $(this).closest(".usermenu-dropdown");
    const { enc_mb_id } = $container.data();

    if (enc_mb_id) {
      const params = new URLSearchParams();
      params.set("mb_id", enc_mb_id);

      if (langCode && langCode !== "ko") {
        params.set("hl", langCode);
      }

      window.location.href = `/new/bbs/new.php?${params.toString()}`;
    }
  });

  // 관리자 회원정보 변경
  $body.on("click", ".usermenu-dropdown .btn_admin_user_info", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $container = $(this).closest(".usermenu-dropdown");
    const { mb_id } = $container.data();

    if (mb_id) {
      const params = new URLSearchParams();
      params.set("w", "u");
      params.set("mb_id", mb_id);

      window.open(`/new/adm/member_form.php?${params.toString()}`);
    }
  });

  // 관리자 포인트내역
  $body.on("click", ".usermenu-dropdown .btn_admin_user_points", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $container = $(this).closest(".usermenu-dropdown");
    const { mb_id } = $container.data();

    if (mb_id) {
      const params = new URLSearchParams();
      params.set("sfl", "mb_id");
      params.set("mb_id", mb_id);

      window.open(`/new/adm/point_list.php?${params.toString()}`);
    }
  });

  // 다른 영역 클릭시 드롭다운 레이어 닫기
  $body.on("click", function () {
    $(".usermenu-dropdown", $body).remove();
  });
});
