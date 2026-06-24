$(function () {
  const isMobile = $("body").hasClass("mobile");

  const daedamoPickBannerSwiper = $(".content-list-daedamo-pick-banner .daedamoPickBannerSwiper");
  if (daedamoPickBannerSwiper && daedamoPickBannerSwiper.length > 0) {
    daedamoPickBannerSwiper.each(function (index, item) {
      $(item).closest(".content-list-daedamo-pick-banner").addClass(`content-list-daedamo-pick-banner-${index}`);
      new Swiper(item, {
        slidesPerView: isMobile ? 3 : 5,
        spaceBetween: isMobile ? 5 : 10,

        navigation: {
          nextEl: `.content-list-daedamo-pick-banner-${index} .daedamo-pick-next`,
          prevEl: `.content-list-daedamo-pick-banner-${index} .daedamo-pick-prev`,
        },
      });
    });
  }
});
