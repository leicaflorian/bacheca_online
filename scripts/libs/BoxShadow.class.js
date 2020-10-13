function BoxShadow(target) {
    function addBoxShadow(target) {
        target.off();
        target.scroll(function (ev, a) {
            var target = $(ev.currentTarget);
            var overlay = target.parent().find(".box_shadow_overlay");
            var sLeft = target.scrollLeft();
            var sRight = target.prop("scrollWidth") - sLeft - target.prop("clientWidth");
            var sSize = sLeft + sRight;
            var maxSize = sSize / 3;

            var leftShadow = overlay.find(".left_shadow");
            var rightShadow = overlay.find(".right_shadow");

            if (sSize > 0) {
                if (sSize > maxSize) {
                    sSize = maxSize;
                }

                if (target.hasClass("align-left") == false) {
                    target.addClass("align-left");
                }

                if (sLeft >= 0) {
                    sLeft = (sLeft * 30) / sSize;

                    if (sLeft <= 30) {
                        leftShadow.css("left", -60 + sLeft);
                        leftShadow.css("box-shadow", "0px 0px " + (60 - (sLeft)) + "px rgba(0, 0, 0, .6)");
                    } else {
                        leftShadow.css("left", -30);
                        leftShadow.css("box-shadow", "0px 0px 30px rgba(0, 0, 0, .6)");
                    }
                }

                if (sRight >= 0) {
                    sRight = (sRight * 30) / sSize;

                    if (sRight <= 30) {
                        rightShadow.css("right", -60 + sRight);
                        rightShadow.css("box-shadow", "0px 0px " + (60 - (sRight)) + "px rgba(0, 0, 0, .6)");
                    } else {
                        rightShadow.css("right", -30);
                        rightShadow.css("box-shadow", "0px 0px 30px rgba(0, 0, 0, .6)");
                    }
                }
            } else {
                leftShadow.css("left", -60);
                leftShadow.css("box-shadow", "0px 0px 30px rgba(0, 0, 0, .6)");

                rightShadow.css("right", -60);
                rightShadow.css("box-shadow", "0px 0px 30px rgba(0, 0, 0, .6)");

                if (target.hasClass("align-left") == true) {
                    target.removeClass("align-left");
                }
            }
        });
    }
    ;

    function init() {
        if (target) {
            addBoxShadow(target);
        }
    }

    this.update = function (target) {
        addBoxShadow(target);
    };

    init();
}



setBoxShadowHeight = function (target) {
    //var overlay = target.next();
    //var oHeight = target.height();
    //var oPaddingTop = Number(target.css("padding-top").replace("px", ""));
    //var oPaddingBottom = Number(target.css("padding-Bottom").replace("px", ""));
    //oHeight  += oPaddingTop + oPaddingBottom;

    //overlay.find(".left_shadow").css("height", oHeight);
    //overlay.find(".right_shadow").css("height", oHeight);
};
