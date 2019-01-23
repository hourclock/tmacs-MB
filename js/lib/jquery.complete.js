(function (window, document, $, undefined) {
    /**
    * テキスト入力が確定したとき指定されたイベントハンドラを呼び出します。
    * @param    handler     {function}  イベントハンドラ。イベントハンドラは jQuery.Event を引数にとる。
    * @return   {jQuery}    jQueryオブジェクト
    */
    $.fn.complete = function (handler) {
        var ENTER_KEY = 13;
        var keypressed = false;

        /**
        * keypressイベント発生時に呼び出されます。
        * @param    event   {jQuery.Event}  イベントオブジェクト
        */
        var onkeypress = function (event) {
            if (event.keyCode !== ENTER_KEY) {
                return;
            }
            keypressed = true;
        };

        /**
        * keyupイベント発生時に呼び出されます。
        * @param    event   {jQuery.Event}  イベントオブジェクト
        */
        var onkeyup = function (event) {
            if (event.keyCode === ENTER_KEY && keypressed) {
                // 入力確定のイベントを発生させます。
                handler.call(this, event);
            }
            keypressed = false;
        };

        // 各要素に対してイベントを付与します。
        return this.each(function (index) {
            $(this).on('keypress', onkeypress).on('keyup', onkeyup);
        });
    };
})(window, document, jQuery);