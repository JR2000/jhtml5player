/*
 * jQuery HTML5 Player Plugin
 */

/*

+------------------------------------------------------------------------------+
| <div class="h5-player">                                                      |
|  +------------------------------------------------------------------------+  |
|  | <div class="h5-player-stage">                                          |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | <video class="h5-player-stage-video">                            |  |  |
|  |  |                                                                  |  |  |
|  |  |                                                                  |  |  |
|  |  |                                                                  |  |  |
|  |  |                                                                  |  |  |
|  |  |                                                                  |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | <div class="h5-player-stage-logooverlay">                        |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | <div class="h5-player-stage-subtitle">                           |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | <div class="h5-player-stage-play">                               |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  +------------------------------------------------------------------------+  |
|  +------------------------------------------------------------------------+  |
|  | <div class="h5-player-control">                                        |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | buttons...                                                       |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  +------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------+
*/

(function() {
    window['jHtml5Player'] = {
        'skins': {}
    };
    /*
     * dumpCss({'.a':{'color':'red','font-size':'12px'}})
     * '.a { color: red; font-size: 12px; }'
     */
    function dumpCss(css_dict) {
        var L = [];
        for (k in css_dict) {
            L.push(k);
            L.push(' { ');
            s_dict = css_dict[k];
            if (typeof(s_dict)=='string') {
                L.push(s_dict);
            }
            else {
                for (s in s_dict) {
                    L.push(s + ':' + s_dict[s] + ';');
                }
            }
            L.push(' }\n');
        }
        return L.join('');
    }

    /*
     * dumpStyle({'color':'red','font-size':'12px'})
     * 'color: red; font-size: 12px;'
     */
    function dumpStyle(sty) {
        var L = [];
        for (s in sty) {
            L.push(s + ':' + sty[s]);
        }
        return L.join(';');
    }

    function copDict(d) {
        var nd = {};
        for (s in d) {
            nd[s] = d[s];
        }
        return nd;
    }

    /*
     * dumpElement({'tag':'div','style':{'color':'red'}})
     * '<div style="color:red"></div>'
     */
    function dumpElement(ele) {
        var L = ['<', ele.tag];
        for (p in ele) {
            if (p!='tag' && p!='style' && p!='children') {
                L.push(' ' + p + '="' + ele[p] + '"');
            }
        }
        if (ele.style) {
            L.push(' style="' + dumpStyle(ele.style) + '"');
        }
        L.push('>');
        if (ele.children) {
            for (var i=0; i<ele.children.length; i++) {
                L.push(dumpElement(ele.children[i]));
            }
        }
        L.push('</' + ele.tag + '>');
        return L.join('');
    }

    /*
     * create css on $(document).ready().
     */
    function createCss(css_dict) {
        jQuery(function() {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = dumpCss(css_dict);
            document.getElementsByTagName('head')[0].appendChild(style);
        });
    }

    function registerSkin(name, skin_object) {
        jHtml5Player.skins[name] = skin_object;
    }

    // export:
    jHtml5Player.dumpCss = dumpCss;
    jHtml5Player.createCss = createCss;
    jHtml5Player.registerSkin = registerSkin;
})();

function _copy_dict(d) {
    var nd = {};
    for (s in d) {
        nd[s] = d[s];
    }
    return nd;
}

function _dump_style(sty) {
    var L = [];
    for (s in sty) {
        L.push(s + ':' + sty[s]);
    }
    return L.join(';');
}

function _dump_ele(ele) {
    var L = ['<', ele.tag];
    for (p in ele) {
        if (p!='tag' && p!='style' && p!='children') {
            L.push(' ' + p + '="' + ele[p] + '"');
        }
    }
    if (ele.style) {
        L.push(' style="' + _dump_style(ele.style) + '"');
    }
    L.push('>');
    if (ele.children) {
        for (var i=0; i<ele.children.length; i++) {
            L.push(_dump_ele(ele.children[i]));
        }
    }
    L.push('</' + ele.tag + '>');
    return L.join('');
}

function _create_logooverlay(conf) {
    var lo = conf.logo_overlays[0];
    var lo_style = _copy_dict(lo.style);
    lo_style['width'] = lo.width + 'px';
    lo_style['height'] = lo.height + 'px';
    lo_style['display'] = 'block';
    lo_style['position'] = 'absolute';
    lo_style['left'] = lo.margin_x + 'px';
    lo_style['top'] = lo.margin_y + 'px';

    return {
        'tag': 'div',
        'style': lo_style,
    };
}

function _create_subtitle(conf) {
    return {
        'tag': 'div',
        'style': {
            'position': 'absolute',
            'width': conf.video.width + 'px',
            'height': '30px',
            'display': 'block',
            'left': '0px',
            'top': (conf.video.height - 30) + 'px',
            'text-align': 'center',
            'font-size': '18px',
            'font-weight': 'bold',
        },
        'children': [
            {
                'tag': 'span',
                'class': 'h5-player-subtitle',
                'style': {
                    'opacity': '0.9',
                    'color': '#fff',
                    'text-shadow': '1px 0px #000, 0px 1px #000, 0px -1px #000, -1px 0px #000',
                },
            }
        ],
    };
}

var _g_player_id = 0;

function _create_player_id() {
    _g_player_id ++;
    return 'HTML_5_PLAYER_' + _g_player_id;
}

function _create_player_html(conf, player_id) {
    var video_proxy = {};
    var tag_video = {
        'tag': 'video',
        'poster': conf.video.poster,
        'style': {
            'width': conf.video.width + 'px',
            'height': conf.video.height + 'px',
        },
        'children': [
            {
                'tag': 'source',
                'type': 'video/mp4',
                'src': conf.video.src,
            },
        ],
    };

    var lo = conf.logo_overlays[0];
    var lo_style = _copy_dict(lo.style);
    lo_style['width'] = lo.width + 'px';
    lo_style['height'] = lo.height + 'px';
    lo_style['display'] = 'block';
    lo_style['position'] = 'absolute';
    lo_style['left'] = lo.margin_x + 'px';
    lo_style['top'] = lo.margin_y + 'px';

    var tag_logooverlay = {
        'tag': 'div',
        'style': lo_style,
    };

    var player_div = {
        'tag': 'div',
        'id': player_id,
        'class': 'h5-player',
        'style': {
            'display': 'block',
            'width': conf.video.width + 'px',
            'height': (conf.video.height + conf.skin.control_bar.height) + 'px',
            'padding': '0px',
            'margin': '0px',
            'position': 'relative',
            'box-shadow': '0px 0px 10px #999',
        },
        'children': [
            {
                'tag': 'div',
                'class': 'h5-player-stage',
                'style': {
                    'width': conf.video.width + 'px',
                    'height': conf.video.height + 'px',
                    'display': 'block',
                },
                'children' : [
                    tag_video,
                    _create_logooverlay(conf),
                    _create_subtitle(conf),
                    conf.skin.create_big_play_button(conf.video.width, conf.video.height),
                ],

            },
            {
                'tag': 'div',
                'class': 'h5-player-control',
                'style': {
                    'display': 'block',
                    'width': conf.video.width + 'px',
                    'height': conf.skin.control_bar.height + 'px',
                    'position': 'relative',
                    'padding': '0px',
                    'margin': '0px',
                },
                'children': conf.skin.create_controls(conf.video.width, conf.skin.control_bar.height),
            }
        ],
    }
    return _dump_ele(player_div);
}

function _log(s) {
    console.log(s);
}

var _VIDEO_EVENTS = ['click', 'mouseover', 'mouseout', 'loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied', 'stalled', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing', 'waiting', 'seeking', 'ended', 'durationchange', 'timeupdate', 'play', 'pause', 'ratechange', 'volumechange'];

function _create_player(conf, player_id) {
    var v = $('#' + player_id + ' video').get(0);
    var subtitle = $('#' + player_id + ' span.h5-player-subtitle');

    var selector = function(cls) {
        return $('#' + player_id + ' .' + cls);
    };
    var skin_proxy = conf.skin.create_skin_proxy(v);
    $.each(_VIDEO_EVENTS, function(index, evt) {
        var handler = skin_proxy['on' + evt];
        if (typeof(handler)=='function') {
            _log('bind event ' + evt + '...');
            var f = function(e) {
                handler(selector);
            }
            v.addEventListener(evt, f);
        }
    });
    conf.skin.init(selector, v);
    return {
        'id': player_id,
        'setSubtitle': function(s) {
            subtitle.html(s);
        },
        'play': function() {
                v.play();
        },
        'pause': function() {
            if (!v.paused)
                v.pause();
        },
    };
}

$.fn.createPlayer = function() {
    var arg = arguments[0] || {};
    var player_id = _create_player_id();
    $(this[0]).html(_create_player_html(arg, player_id));
    return _create_player(arg, player_id);
};
