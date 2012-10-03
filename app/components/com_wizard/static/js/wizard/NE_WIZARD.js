/**
 * Note - this is probably the worst code in Nuby Express.
 * Steps should be in their own classes and indexed by name not number.
 * Coding is hard.
 *
 * @type {Object}
 */

var NE_WIZARD = {

    Wizard:function () {
        this._paginated = {};
    },

    extend:function () {

        _.extend(NE_WIZARD.Wizard.prototype, {
            paginate:function (order) {
                var self = this;
                setTimeout(function () {
                    self._paginate(order);
                }, 750);
            },

            _paginate:function (order) {
                var self = this;
                this.current_order = order;

                if (!this._paginated[order]) {
                    this._bind_order_buttons();
                }

                $('.steps .step').hide();
                this.step().show();
                this.load_step();

                this._update_nav(order);
            },

            _update_nav:function (order) {
                $('.nav .step', this.root).hide();
                var first = true;
                while (order > 0) {
                    $('.nav .step_' + order).show();
                    if (first) {
                        $('.nav .step_' + order).removeClass('past');
                    } else {
                        $('.nav .step_' + order).addClass('past');
                    }
                    first = false;
                    --order;
                }
            },

            step:function (order) {
                if (!arguments.length) order = this.current_order;
                return  $('.steps .step_' + order, this.root);
            },

            load_step:function (order, step) {
                // override this for custom behavior.
            },

            leave_step:function (cb, order, next_order) {
                // override this for custom behavior.
                cb(true);
            },

            show_button:function (order, which, show) {
                console.log('show_buttons:', order, which, show);
                var vis_step = this.step(order);
                $('button.' + which, vis_step).css('visibility', show ? 'visible' : 'hidden'
                );
            },

            show_buttons:function () {
                var args = Array.prototype.slice.call(arguments);
                if (_.isNumber(args[0])) {
                    var order = args.shift();
                } else {
                    var order = this.current_order;
                }
                var hiders = _.difference(['prev', 'next', 'first'], args);
                var self = this;
                _.each(hiders, function (which) {
                    self.show_button(order, which, false);
                });

                _.each(args, function (which) {
                    self.show_button(order, which, true);
                })
            },

            load:function (selector, id) {

                this.selector = selector;
                this.id = id;
                var self = this;

                this.root = $(this.selector);
                if (id){
                    this.root.load('/wizard/' + this.id, function () {
                        self.init();
                    })
                }
            },

            init:function () {
                this.paginate(1, false, true);
            },

            add_message:function (params) {
                $('.feedback', this.root).html(this._msg_template(params));
                if (params.fade) {
                    var self = this;
                    var tot = setTimeout(function () {
                        $('.feedback .message', self.root).fadeOut(Math.max(500, params.fade/2),
                            function () {
                                $('.feedback', self.root).html('');
                                tot = false
                            });
                    }, params.fade);
                    $('.feedback .message', self.root).on('click',
                        function () {
                            $('.feedback', self.root).html('');
                            if (tot) {
                                clearTimeout(tot);
                                tot = false;
                            }
                        })
                }
            },

            _bind_order_buttons:function () {
                console.log('bind order buttons: ', this.current_order);
                this._paginated[this.current_order] = true;
                var self = this;

                function _on_go(order, dest) {
                    var vis_step = self.step(order);
                    return function () {
                        self.leave_step(function (good) {
                            if (good) {
                                $('button', vis_step).css('visibility', 'hidden');
                                self.paginate(dest);
                            }
                        }, order, dest);
                        return false;
                    }
                }

                var next_order = this.current_order + 1;
                var prev_order = Math.max(1, this.current_order - 1);
                var step = this.step();

                $('button.prev', step).bind('click', _on_go(self.current_order, prev_order));
                $('button.next', step).bind('click', _on_go(self.current_order, next_order));
                $('button.first', step).bind('click', _on_go(self.current_order, 1));
            },

            _msg_template:_.template('<div class="message <%= type %>"><h3><%= title %></h3><p><%= content %></p></div>')
        });

    }
}

if (_) {
    NE_WIZARD.extend();

} else {
    $(function () {
        NE_WIZARD.extend();
    })
}