"use strict";

/**
* Modal  ver1.2 (alert+content 통합)
* 작성자 : pyeon
* gitgub : https://github.com/soonya27/modal.js
* 이중 모달시 const alertModal = new Modal(); 새로 지정필요

* multi : false (defualt)
--remove() 기본 기존모달 무조건 닫힘

* multi : true   -> 이중모달시 기존모달 callBack option에 따라 조절가능
--confirmDoneCallBack, cancelCallBack 없을시 default버튼에  removeMdal() 적용
-- multi:true 여도 callback이 없으면 기본 닫힘
--callBack options 지정시 modal(변수달라질수있음).remove(); 로 해당 모달 제거해줘야함

*/

// 쿠키 글로벌 유틸  -> (기존엔 메인페이지에만 글로벌로 정의돼 있어 modal 내부 재정의)
function setdayCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

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

class Modal {
  constructor() {
    this.bg = `<div class="modal-bg"></div>`;
    this.body = document.querySelector("body");
    //this.modal
    //this.options
    // this.multifulModalsCnt  //생성당시 다른 모달 갯수
  }

  showModal(options) {
    this.options = options;

    // 쿠키 가드: "오늘 안보기" 처리된 상태면 렌더 생략 후 onClose 만 호출
    if (options.cookieKey && getdayCookie(options.cookieKey)) {
      this.#fireClose();
      return;
    }
    // 중복 노출 가드: 동일 selector 모달이 이미 있으면 렌더 생략 후 onClose 만 호출
    if (options.dedupeSelector && document.querySelector(options.dedupeSelector)) {
      this.#fireClose();
      return;
    }

    this.#makeDiv();
    this.#makeModal();
    this.#setStyle();
    this.#setClickListener();
    this.#bindCookieCheckbox();
  } //showModal

  // X 닫기 클릭 시 "오늘 안보기" 체크 박스 → 쿠키 자동 저장
  #bindCookieCheckbox() {
    const { cookieKey, cookieCheckboxSelector } = this.options;
    if (!cookieKey || !cookieCheckboxSelector) return;
    $(this.modal)
      .find(".modalCancelIcon_content")
      .on("click", () => {
        if ($(this.modal).find(cookieCheckboxSelector).is(":checked")) {
          setdayCookie(cookieKey, 1, 1);
        }
      });
  }

  // onClose 콜백 — 모달이 닫힐(또는 가드로 skip 될) 때 1회 발화
  #fireClose() {
    if (typeof this.options?.onClose !== "function") return;
    const cb = this.options.onClose;
    this.options.onClose = null;
    cb();
  }

  #makeDiv() {
    const alertModal = document.createElement("div");
    const alertBg = document.createElement("div");
    alertModal.classList.add("modal-wrap");
    alertModal.classList.add(`content-modal`);
    if (!this.options?.content) {
      alertModal.classList.add(`alert-modal`);
    }
    const classNameList = this.options?.className?.split(" ") || [];
    classNameList.forEach(function (item) {
      alertModal.classList.add(item);
    });

    alertBg.classList.add(`content-bg`);
    this.modal = alertModal;
    this.bg = alertBg;
  }

  #makeModal() {
    const optionsTitle = this.options?.title ? `<div class="pop-message">${this.options?.title || ""}</div>` : "";
    const modalHtml = ` <div class="pop-header">${this.options.header || ""}</div>
                            <button class="modal_btn btn-layerPop-close modalCancelIcon_content" type="button" id="">
                                <img src="../../../images/remote/image.daedamo.com/images/img/renew/i_close_black.svg" alt="닫기 이미지"/>
                            </button>
                            <div class="layerPop-inner">
                                ${optionsTitle}
                                <div class="pop-content">
                                    ${this.options.content || ""}
                                </div>
                                <div class="btn-wrap">
                                    <button class="modal_btn cancel modalCancel_content ${this.options.btn?.cancel?.className || ""}" id=""  style="display:none">${this.options.btn?.cancel?.text || $.i18n("common.sign.no")}</button>
                                    <button class="modal_btn confirm default btnAlertConfirm_content ${this.options.btn?.confirm?.className || ""}" id=""  style="display:none">${this.options.btn?.confirm?.text || $.i18n("common.sign.confirm")}</button>
                                    <button class="modal_btn done default modalDone_content ${this.options.btn?.confirm?.className || ""}" id="" style="width:100%; display:none">${this.options.btn?.confirm?.text || $.i18n("common.sign.confirm")}</button>
                                </div>
                            </div>`;
    this.modal.innerHTML = modalHtml;

    this.body.appendChild(this.modal);
    this.body.appendChild(this.bg);
  }

  #setStyle() {
    //사이즈 기본값
    if (this.options?.custom?.size) {
      const sizeObj = {
        s: "390px",
        m: "500px",
        l: "800px",
      };
      this.modal.style.width = sizeObj[`${this.options?.custom?.size || s}`];
    }
    //사이즈 지정값
    if (this.options?.custom?.width) {
      this.modal.style.width = this.options?.custom?.width;
    }

    //multiful 팝업 z-index
    const DEFAULT_BG_ZINDEX = 10;
    const DEFAULT_MODAL_ZINDEX = 11;
    this.multifulModalsCnt = document.querySelectorAll(".modal-wrap").length - 1;
    if (this.multifulModalsCnt > 0) {
      //이중팝업여부
      this.multiful = true;
      //modal
      this.modal.style.zIndex = DEFAULT_MODAL_ZINDEX + this.multifulModalsCnt * 2;
      //bg
      this.bg.style.zIndex = DEFAULT_BG_ZINDEX + this.multifulModalsCnt * 2;
    }

    //X닫기버튼 옵션
    if (this.options?.btn?.close === false) {
      this.modal.querySelector(".modalCancelIcon_content").style.display = "none";
    }

    //scrollTop
    // this.bodyScrollTop = document.scrollingElement.scrollTop;
    // this.body.classList.add("not_scroll");

    //doWhat에 따른 button 보이기 (done/confirm)
    const alertPopModal = {
      confirm: [".modalCancel_content", ".btnAlertConfirm_content"],
      done: [".modalDone_content"],
    };
    alertPopModal[this.options.doWhat || "confirm"].forEach((btnList) => {
      //this.modal 사용을 위해 arrow funs
      this.modal.querySelector(btnList).style.display = "block";
    });
  }

  #setClickListener() {
    //이중팝업 this.options.multi
    const modalBtnWrap = this.modal.querySelectorAll("button.modal_btn");
    if (this.options.multi) {
      //둘다 없을때 -> 다 막기
      if (!this.options.confirmDoneCallBack && !this.options.cancelCallBack) {
        modalBtnWrap.forEach((buttons) => {
          buttons.addEventListener("click", () => {
            this.remove();
          });
        });
      }
      //confirm만 있을때
      if (this.options.confirmDoneCallBack && !this.options.cancelCallBack) {
        modalBtnWrap.forEach((buttons) => {
          if (!buttons.className.includes("modalDone_content") && !buttons.className.includes("btnAlertConfirm_content")) {
            buttons.addEventListener("click", () => {
              this.remove();
            });
          }
        });
      }
      //cancel만 있을때
      if (this.options.cancelCallBack && !this.options.confirmDoneCallBack) {
        modalBtnWrap.forEach((buttons) => {
          if (!buttons.className.includes("modalCancel_content") && !buttons.className.includes("modalCancelIcon_content")) {
            buttons.addEventListener("click", () => {
              this.remove();
            });
          }
        });
      }
    } else {
      //이중팝업X  -> 팝업이 자동 remove 후 새 팝업만 뜸
      modalBtnWrap.forEach((buttons) => {
        buttons.addEventListener("click", () => {
          this.remove();
        });
      });
      this.modal.querySelector(".modalCancelIcon_content").addEventListener("click", () => {
        this.remove();
      });
    }

    //callBack 적용
    const alertBtnWrap = this.modal.querySelector(".layerPop-inner .btn-wrap");
    if (this.options.doWhat === "confirm") {
      alertBtnWrap.querySelector(".btnAlertConfirm_content").addEventListener("click", this.options.confirmDoneCallBack);
    } else {
      alertBtnWrap.querySelector(".modalDone_content").addEventListener("click", this.options.confirmDoneCallBack);
    }
    if (this.options.cancelCallBack) {
      alertBtnWrap.querySelector(".modalCancel_content").addEventListener("click", this.options.cancelCallBack); //취소/아니요버튼
      this.modal.querySelector(".modalCancelIcon_content").addEventListener("click", this.options.cancelCallBack); //X닫기버튼
    }
  }

  remove = () => {
    this.modal.remove();
    this.bg.remove();

    //이중팝업 여부에 따라 body scroll 막기
    this.multifulModalsCnt > 0 || this.body.classList.remove("not_scroll");

    //scrollTop
    // window.scrollTo(0, this.bodyScrollTop);

    this.#fireClose();
  };
} //Modal

/**
 * alert 메시지 표시
 * @param {*} message 메시지
 * @param {*} buttons 버튼옵션
 * @returns
 */
window.showModalAlert = async (message, buttons = {}) => {
  if (window._messageModal) {
    window._messageModal.remove();
  }

  return new Promise((resolve) => {
    window._messageModal = new Modal();
    window._messageModal.showModal({
      doWhat: "done",
      title: nl2br(message),
      btn: Object.assign(
        {
          close: false,
        },
        buttons,
      ),
      confirmDoneCallBack: resolve,
    });
  });
};

/**
 * confirm 메시지 표시
 * @param {*} message 메시지
 * @param {*} buttons 버튼옵션
 * @returns
 */
window.showModalConfirm = async (message, buttons = {}) => {
  if (window._messageModal) {
    window._messageModal.remove();
  }

  return new Promise((resolve) => {
    window._messageModal = new Modal();
    window._messageModal.showModal({
      doWhat: "confirm",
      title: nl2br(message),
      btn: Object.assign(
        {
          close: false,
        },
        buttons,
      ),
      confirmDoneCallBack: () => resolve(true),
      cancelCallBack: () => resolve(false),
    });
  });
};

/**
 * 팝업 순차 실행 헬퍼.
 * { onClose } 옵션을 받아 닫힐 때 호출해야함
 * 예: runPopupChain(["showJpEventModal202605", "showMainBoardsModal"])
 */
window.runPopupChain = function (popups) {
  const list = popups.slice();
  const next = () => {
    const name = list.shift();
    if (!name) return;
    const fn = window[name];
    if (typeof fn !== "function") return next();
    fn({ onClose: next });
  };

  whenI18nReady(next);
};

const showDiscussionModal = (data) => whenI18nReady(() => _showDiscussionModal(data));

/**
 * custom modal 등업관련 팝업 (등업게시글 작성 후)
 * global X
 */
const _showDiscussionModal = async (data) => {
  return new Promise((resolve) => {
    const discussionModal = new Modal();
    discussionModal.showModal({
      doWhat: "done",
      title: `<img src="../../../images/remote/image.daedamo.com/images/img/renew/discussion_guide/i_discuttion_modal_2.png"/>
      <strong>${$.i18n("discussion.modal.title")}</strong>
      <div class="condition">
        <ul>
          <li class="${data.articles >= 1}">${$.i18n("discussion.modal.label.article")} <p><strong>${data.articles}</strong>/1</p></li>
          <li class="${data.comments >= 10}">${$.i18n("discussion.modal.label.comment")} <p><strong>${data.comments}</strong>/1</p></li>
          <li class="${data.evaluation >= 1}">${$.i18n("discussion.modal.label.evaluation")} <p><strong>${data.evaluation}</strong>/1</p></li>
        </ul>
      </div>
      <p>${$.i18n("discussion.modal.info.guide")}</p>`,
      className: "discussion_alert",
      btn: {
        confirm: {
          text: `${$.i18n("discussion.modal.button.guide")}<span>▶</span>`,
        },
        close: false,
      },
      confirmDoneCallBack: function (e) {
        window.location.replace("/discussion/4361"); //테스트서버 == 상용서버 동일 id
      },
    });
  });
};

/**
 * custom modal 주요 게시판 안내 팝업
 */
window.showMainBoardsModal = (options = {}) => {
  whenI18nReady(() => _showMainBoardsModal(options));
};

const _showMainBoardsModal = (options) => {
  new Modal().showModal({
    doWhat: "done",
    content: `
      <strong class="bd-modal-title">${$.i18n("board.mainModal.title")}</strong>
      <ul class="bd-modal-list">
        <li>
          <div class="bd-modal-img-wrap">
            <img src="../../../images/remote/image.daedamo.com/images/img/renew/icon/2026/i_photo_review.svg" alt=""/>
          </div>
          <div class="bd-modal-info">
            <p>${$.i18n("board.mainModal.info.photoReview")}</p>
            <a href="${ddmLangUrl("/photo2")}" class="bd-modal-btn">${$.i18n("board.mainModal.button.photoReview")}<span>▶</span></a>
          </div>
        </li>
        <li>
          <div class="bd-modal-img-wrap">
            <img src="../../../images/remote/image.daedamo.com/images/img/renew/icon/2026/i_talk_talk.svg" alt=""/>
          </div>
          <div class="bd-modal-info">
            <p>${$.i18n("board.mainModal.info.forum")}</p>
            <a href="${ddmLangUrl("/forum")}" class="bd-modal-btn">${$.i18n("board.mainModal.button.forum")}<span>▶</span></a>
          </div>
        </li>
        <li>
          <div class="bd-modal-img-wrap">
            <img src="../../../images/remote/image.daedamo.com/images/img/renew/icon/2026/i_level.svg" alt=""/>
          </div>
          <div class="bd-modal-info">
            <p>${$.i18n("board.mainModal.info.levelUp")}</p>
            <a href="${ddmLangUrl("/discussion/4361")}" class="bd-modal-btn">${$.i18n("board.mainModal.button.levelUp")}<span>▶</span></a>
          </div>
        </li>
      </ul>
      <div class="bd-modal-no-show-today">
        <input type="checkbox" id="bdModalNoCheck" class="bd-modal-checkbox">
        <label for="bdModalNoCheck">${$.i18n("common.modal.checkbox.noShowToday")}</label>
      </div>
    `,
    className: "main_boards_modal",
    cookieKey: "mainBoardsModal",
    cookieCheckboxSelector: "#bdModalNoCheck",
    dedupeSelector: ".main_boards_modal",
    onClose: options.onClose,
  });
};

/**
 * custom modal 2026-05 JP 이벤트 안내 팝업 (기간 한정: 2026-05-20 ~ 2026-06-14)
 * 노출 위치: index / hlist list / photo2 list (tail.sub.php 분기)
 */
window.showJpEventModal202605 = (options = {}) => {
  whenI18nReady(() => _showJpEventModal202605(options));
};

const _showJpEventModal202605 = (options) => {
  const content = `
    <div class="jp-card" data-view="main">
      <!-- 메인 -->
      <div class="jp-view jp-view--main">
        <span class="jp-period-badge">5.20 - 6.14</span>
        <h3 class="jp-title">期間限定キャンペーン</h3>
        <div class="jp-coupon">
          <img class="jp-coupon-img" src="../../../images/remote/image.daedamo.com/images/img/renew/event/202605_jp_event/amazon_gift.png" alt="Amazon Gift Card"/>
          <span class="jp-coupon-badge" aria-label="10名様"></span>
        </div>
        <p class="jp-desc">
          投稿またはコメントをしていただいた<br/>
          日本会員様の中から抽選で、<br/>
          <strong>Amazonギフト券1,000円</strong>分を<br/>
          プレゼントいたします！
        </p>
        <button type="button" class="jp-link-btn jp-to-notice">
          注意事項<span class="jp-arrow jp-arrow--right" aria-hidden="true"></span>
        </button>
      </div>
      <!-- 주의사항 -->
      <div class="jp-view jp-view--notice">
        <h3 class="jp-notice-title">注意事項</h3>
        <dl class="jp-notice-period">
          <div><dt>キャンペーン期間</dt><dd>5.20 - 6.14</dd></div>
          <div><dt>当選者発表</dt><dd>6.17</dd></div>
        </dl>
        <ul class="jp-notice-list">
          <li>
            当選者の発表および賞品の発送は、<br>会員情報にご登録のメールアドレス宛に<br>ご連絡いたします。<br/>
            キャンペーンにご参加いただく前に、<br>ご登録のメールアドレスを<br>ご確認ください。
          </li>
        </ul>
        <button type="button" class="jp-link-btn jp-to-main">
          <span class="jp-arrow jp-arrow--left" aria-hidden="true"></span>戻る
        </button>
      </div>
    </div>
    <div class="jp-no-show-today">
      <input type="checkbox" id="jpEventModal202605NoCheck" class="bd-modal-checkbox">
      <label for="jpEventModal202605NoCheck">今日はもう表示しない</label>
    </div>
  `;

  new Modal().showModal({
    doWhat: "done",
    content,
    className: "jp_event_modal_202605",
    cookieKey: "jpEventModal202605",
    cookieCheckboxSelector: "#jpEventModal202605NoCheck",
    dedupeSelector: ".jp_event_modal_202605",
    onClose: options.onClose,
  });

  // 뷰 전환: 주의사항 <-> 돌아가기
  const $card = $(".jp_event_modal_202605 .jp-card");
  $card.on("click", ".jp-to-notice", () => $card.attr("data-view", "notice"));
  $card.on("click", ".jp-to-main", () => $card.attr("data-view", "main"));
};

/**
 * custom modal (2604만우절 팝업 --> 사용X)
 * global X
 */
// const showCustomMainPop = () => {
//   if (getdayCookie("customMainPop") || !!$(".custom_main_pop").length) return;

//   const customMainPop = new Modal();
//   customMainPop.showModal({
//     doWhat: "done",
//     title: `
//       <button type="button" class="cmp-modal-close-btn">
//         <img src="../../../images/remote/image.daedamo.com/images/img/renew/i_close_black.svg" alt="닫기 이미지"/>
//       </button>
//       <a href="#" class="cmp-modal-link">
//         <img src="/new/img/dedamo_0425_03.jpg" alt=""/>
//       </a>
//       <div class="cmp-modal-no-show-today">
//         <input type="checkbox" id="cmpModalNoCheck" class="cmp-modal-checkbox">
//         <label for="cmpModalNoCheck">${$.i18n("common.modal.checkbox.noShowToday")}</label>
//       </div>
//     `,
//     className: "custom_main_pop",
//     btn: { close: false },
//     confirmDoneCallBack: () => {},
//   });

//   $(customMainPop.modal)
//     .find(".cmp-modal-close-btn")
//     .on("click", () => {
//       if ($(customMainPop.modal).find("#cmpModalNoCheck").is(":checked")) {
//         setdayCookie("customMainPop", 1, 1);
//       }
//       customMainPop.remove();
//     });
// };
