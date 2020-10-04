(function (w, d) {

    var body = d.body,
        $ = d.querySelector.bind(d),
        $$ = d.querySelectorAll.bind(d),
        root = $('html'),
        gotop = $('#gotop'),
        menu = $('#menu'),
        animate = w.requestAnimationFrame,
        scrollSpeed = 200 / (1000 / 60),
        forEach = Array.prototype.forEach,
        even = ('ontouchstart' in w && /Mobile|Android|iOS|iPhone|iPad|iPod|Windows Phone|KFAPWI/i.test(navigator.userAgent)) ? 'touchstart' : 'click',
        noop = function () { },
        offset = function (el) {
            var x = el.offsetLeft,
                y = el.offsetTop;

            if (el.offsetParent) {
                var pOfs = arguments.callee(el.offsetParent);
                x += pOfs.x;
                y += pOfs.y;
            }

            return {
                x: x,
                y: y
            };
        },
        rootScollTop = function() {
            return d.documentElement.scrollTop || d.body.scrollTop;
        };

    var Blog = {
        goTop: function (end) {
            var top = rootScollTop();
            var interval = arguments.length > 2 ? arguments[1] : Math.abs(top - end) / scrollSpeed;

            if (top && top > end) {
                w.scrollTo(0, Math.max(top - interval, 0));
                animate(arguments.callee.bind(this, end, interval));
            } else if (end && top < end) {
                w.scrollTo(0, Math.min(top + interval, end));
                animate(arguments.callee.bind(this, end, interval));
            } else {
                this.toc.actived(end);
            }
        },
        toggleGotop: function (top) {
            if (top > w.innerHeight / 2) {
                gotop.classList.add('in');
            } else {
                gotop.classList.remove('in');
            }
        },
        toggleMenu: function (flag) {
            var main = $('#main');
            if (flag) {
                menu.classList.remove('hide');

                if (w.innerWidth < 1241) {
                    // mask.classList.add('in');
                    menu.classList.add('show');
                    root.classList.add('lock');
                }

            } else {
                menu.classList.remove('show');
                // mask.classList.remove('in');
                root.classList.remove('lock');
            }
        },
        fixedHeader: function (top) {
            // if (top > header.clientHeight) {
            //     header.classList.add('fixed');
            // } else {
            //     header.classList.remove('fixed');
            // }
        },
        toc: (function () {
            var toc = $('#post-toc');

            if (!toc || !toc.children.length) {
                return {
                    fixed: noop,
                    actived: noop
                }
            }

            var bannerH = $('.post-header').clientHeight,
                titles = $('#post-content').querySelectorAll('h1, h2, h3, h4, h5, h6');

            toc.querySelector('a[href="#' + encodeURI(titles[0].id) + '"]').parentNode.classList.add('active');

            // Make every child shrink initially
            var tocChilds = toc.querySelectorAll('.post-toc-child');
            for (i = 0, len = tocChilds.length; i < len; i++) {
                tocChilds[i].classList.add('post-toc-shrink');
            }
            var firstChild =
                toc.querySelector('a[href="#' + encodeURI(titles[0].id) + '"]')
                    .nextElementSibling;
            if (firstChild) {
                firstChild.classList.add('post-toc-expand');
                firstChild.classList.remove('post-toc-shrink');
            }
            toc.classList.remove('post-toc-shrink');

            /**
             * Handle toc active and expansion
             * @param prevEle previous active li element
             * @param currEle current active li element
             */
            var handleTocActive = function (prevEle, currEle) {
                prevEle.classList.remove('active');
                currEle.classList.add('active');

                var siblingChilds = currEle.parentElement.querySelectorAll('.post-toc-child');
                for (j = 0, len1 = siblingChilds.length; j < len1; j++) {
                    siblingChilds[j].classList.remove('post-toc-expand');
                    siblingChilds[j].classList.add('post-toc-shrink');
                }
                var myChild = currEle.querySelector('.post-toc-child');
                if (myChild) {
                    myChild.classList.remove('post-toc-shrink');
                    myChild.classList.add('post-toc-expand');
                }
            };

            return {
                fixed: function (top) {
                    top >= bannerH ? toc.classList.add('fixed') : toc.classList.remove('fixed');
                },
                actived: function (top) {
                    for (i = 0, len = titles.length; i < len; i++) {
                        if (top > offset(titles[i]).y - 5) {
                            var prevListEle = toc.querySelector('li.active');
                            var currListEle = toc.querySelector('a[href="#' + encodeURI(titles[i].id) + '"]').parentNode;

                            handleTocActive(prevListEle, currListEle);
                        }
                    }

                    if (top < offset(titles[0]).y) {
                        handleTocActive(
                            toc.querySelector('li.active'),
                            toc.querySelector('a[href="#' + encodeURI(titles[0].id) + '"]').parentNode
                        );
                    }
                }
            }
        })(),

        search: function () {
            var searchWrap = $('#search-wrap');

            function toggleSearch() {
                searchWrap.classList.toggle('in');
            }

            $('#search').addEventListener(even, toggleSearch);
        },

        waterfall: function () {

            if (w.innerWidth < 760) return;

            forEach.call($$('.waterfall'), function (el) {
                var childs = el.querySelectorAll('.waterfall-item');
                var columns = [0, 0];

                forEach.call(childs, function (item) {
                    var i = columns[0] <= columns[1] ? 0 : 1;
                    item.style.cssText = 'top:' + columns[i] + 'px;left:' + (i > 0 ? '50%' : 0);
                    columns[i] += item.offsetHeight;
                })

                el.style.height = Math.max(columns[0], columns[1]) + 'px';
                el.classList.add('in')
            })

        },

        tabBar: function (el) {
            el.parentNode.parentNode.classList.toggle('expand')
        },

        page: (function () {
            var $elements = $$('.fade');
            var visible = false;

            return {
                loaded: function () {
                    forEach.call($elements, function (el) {
                        el.classList.add('in')
                    });
                    visible = true;
                },
                unload: function () {
                    forEach.call($elements, function (el) {
                        el.classList.remove('in')
                    });
                    visible = false;
                },
                visible: visible
            }

        })(),

        loadScript: function (scripts) {
            scripts.forEach(function (src) {
                var s = d.createElement('script');
                s.src = src;
                s.async = true;
                body.appendChild(s);
            })
        }
    };

    w.addEventListener('DOMContentLoaded', function () {
        Blog.waterfall();
        var top = rootScollTop();
        Blog.toc.fixed(top);
        Blog.toc.actived(top);
        Blog.page.loaded();
    });

    var ignoreUnload = false;
    var $mailTarget = $('a[href^="mailto"]');
    if($mailTarget) {
        $mailTarget.addEventListener(even, function () {
            ignoreUnload = true;
        });
    }

    w.addEventListener('beforeunload', function (e) {
        if (!ignoreUnload) {
            Blog.page.unload();
        } else {
            ignoreUnload = false;
        }
    });

    w.addEventListener('pageshow', function () {
        // fix OSX safari #162
        !Blog.page.visible && Blog.page.loaded();
    });

    w.addEventListener('resize', function () {
        w.BLOG.even = even = 'ontouchstart' in w ? 'touchstart' : 'click';
        Blog.toggleMenu();
        Blog.waterfall();
    });

    gotop.addEventListener(even, function () {
        animate(Blog.goTop.bind(Blog, 0));
    }, false);

    // menuToggle.addEventListener(even, function (e) {
    //     Blog.toggleMenu(true);
    //     e.preventDefault();
    // }, false);

    // menuOff.addEventListener(even, function () {
    //     menu.classList.add('hide');
    // }, false);

    // mask.addEventListener(even, function (e) {
    //     Blog.toggleMenu();
    //     Blog.hideOnMask.forEach(function (hide) {
    //         hide()
    //     });
    //     e.preventDefault();
    // }, false);

    d.addEventListener('scroll', function () {
        var top = rootScollTop();
        Blog.toggleGotop(top);
        Blog.fixedHeader(top);
        Blog.toc.fixed(top);
        Blog.toc.actived(top);
    }, false);

    Blog.noop = noop;
    Blog.even = even;
    Blog.$ = $;
    Blog.$$ = $$;

    Object.keys(Blog).reduce(function (g, e) {
        g[e] = Blog[e];
        return g
    }, w.BLOG);
})(window, document);
