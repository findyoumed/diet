$(function () {
  const isMobile = $("body").hasClass("mobile");

  const dietonPickBannerSwiper = $(".content-list-dieton-pick-banner .dietonPickBannerSwiper");
  if (dietonPickBannerSwiper && dietonPickBannerSwiper.length > 0) {
    dietonPickBannerSwiper.each(function (index, item) {
      $(item).closest(".content-list-dieton-pick-banner").addClass(`content-list-dieton-pick-banner-${index}`);
      new Swiper(item, {
        slidesPerView: isMobile ? 3 : 5,
        spaceBetween: isMobile ? 5 : 10,

        navigation: {
          nextEl: `.content-list-dieton-pick-banner-${index} .dieton-pick-next`,
          prevEl: `.content-list-dieton-pick-banner-${index} .dieton-pick-prev`,
        },
      });
    });
  }
});
