/*! raphaelDOM 2013-07-20 */
var raphaelDOM={draw:{none:_.identity},utils:{getProp:function(target,fields){if(!_.isArray(fields)){fields=_.toArray(arguments).slice(1)}hasField=_.find(fields,function(field){return target.hasOwnProperty(field)});if(!hasField){throw new Error("cannot find any field "+fields.join(",")+" in target)")}return target[hasField]||0},propBasis:function(field){switch(field){case"width":case"left":case"right":return"width";break;case"top":case"bottom":case"height":return"height";break;default:throw new Error("cannot find basis for "+field)}},scale:function(scale,basis){if(isNaN(basis))throw new Error("non basis passed to scale: "+basis);if(_.isNumber(scale))return scale;if(/%$/.test(scale)){scale=new Number(scale.replace("%",""));return scale*basis/100}else{throw new Error("strange scale ",+scale)}}}};raphaelDOM.Dimension=function(){function Dimension(){this.value=0;var args=_.toArray(arguments);this.init.apply(this,args)}Dimension.prototype={inset:function(rect){rect=rect.clone();rect.left+=this.getLeft();rect.right-=this.getRight();rect.top+=this.getTop();rect.bottom-=this.getBottom();rect.recalculate();return rect},expand:function(rect){rect=rect.clone();rect.left-=ths.getLeft();rect.right+=this.getRight();rect.top-=this.getTop();rect.bottom+=this.getBottom();rect.recalculate();return rect},getLeft:function(basis){if(!basis.TYPE=="RECT")throw new Error("basis must be rect");var value=raphaelDOM.utils.getProp(this,"left","width","value");return raphaelDOM.scale(value,basis)},getRight:function(basis){if(!basis.TYPE=="RECT")throw new Error("basis must be rect");var value=raphaelDOM.utils.getProp(this,"right","width","value");return raphaelDOM.scale(value,basis)},getTop:function(basis){if(!basis.TYPE=="RECT")throw new Error("basis must be rect");if(this.basis.root)return 0;var value=raphaelDOM.utils.getProp(this,"top","height","value");return raphaelDOM.scale(value,basis)},getBottom:function(basis){if(!basis.TYPE=="RECT")throw new Error("basis must be rect");var value=raphaelDOM.utils.getProp(this,"bottom","height","value");return raphaelDOM.scale(value,basis)},init:function(){var args=_.toArray(arguments);switch(args.length){case 0:this.value=0;break;case 1:if(_.isObject(args[0])){_.extend(this,args[0])}else{this.value=args[0]}break;case 2:this.width=args[0];this.height=args[1];break;case 3:throw new Error("no three argument API for Dimension");break;case 4:default:_.each("left","top","right","bottom",function(f,i){this[f]=args[i]},this);break}}};return Dimension}();raphaelDOM.blend=function(){var _DEBUG=true;function _getElements(box,parentName){if(!parentName){parentName=""}else{parentName+="."}var name=parentName+(box.name||0);var out={};var data={box:box,rect:box.rect()};out[name]=data;data.attr=box.element?box.element.attr():{};return _.reduce(box._children,function(out,child){var child_out=_getElements(child,name);_.each(child_out,function(data,key){var u=1;var _key=key;while(out.hasOwnProperty(_key)){_key=key+u;++u}out[_key]=data;return out});return out},out)}return function(box1,box2,ms,easing,callback){console.log("blending ",box1.name," with ",box2.name," over ",ms," easing ",easing);var tempPaper=Raphael(box1.parent);if(_DEBUG)console.log("blending ",box1.name,"to",box2.name);var box1elements=_getElements(box1);box2.setPaper(tempPaper);box2.draw();var box2elements=_getElements(box2);box2.undraw();tempPaper.clear();box2.setPaper(box1.paper);var commonKeys=_.intersection(_.keys(box1elements),_.keys(box2elements));var oldKeys=_.difference(_.keys(box1elements),_.keys(box2elements));function onDone(){if(_DEBUG)console.log("done with blend of ",box1.name);box1.paper.clear();box2.draw();callback()}var baseElement;if(commonKeys.length){_.each(commonKeys,function(key){var data=box1elements[key];if(data.box.element){if(baseElement){data.box.element.animateWith(baseElement,null,box2elements[key].attr,ms,easing)}else{baseElement=data.box.element.animate(box2elements[key].attr,ms,easing,onDone)}}});_.each(oldKeys,function(key){var data=box1elements[key];if(_DEBUG)console.log("fading old element ",key);if(data.box.element){console.log("fading ",key);data.box.element.animate({opacity:0},ms,easing)}else{if(_DEBUG)console.log("key ",key," has no element")}})}else{_.each(oldKeys,function(key){var data=box1elements[key];if(_DEBUG)console.log("fading old key ",key);data.box.element.animate({opacity:0},ms,easing)});setTimeout(ms,onDone)}box2.undraw()}}();raphaelDOM.browserDetect=function(){!function(window,undefined){"use strict";var EMPTY="",UNKNOWN="?",FUNC_TYPE="function",UNDEF_TYPE="undefined",OBJ_TYPE="object",MAJOR="major",MODEL="model",NAME="name",TYPE="type",VENDOR="vendor",VERSION="version",ARCHITECTURE="architecture",CONSOLE="console",MOBILE="mobile",TABLET="tablet";var util={has:function(str1,str2){return str2.toLowerCase().indexOf(str1.toLowerCase())!==-1},lowerize:function(str){return str.toLowerCase()}};var mapper={rgx:function(){for(var result,i=0,j,k,p,q,matches,match,args=arguments;i<args.length;i+=2){var regex=args[i],props=args[i+1];if(typeof result===UNDEF_TYPE){result={};for(p in props){q=props[p];if(typeof q===OBJ_TYPE){result[q[0]]=undefined}else{result[q]=undefined}}}for(j=k=0;j<regex.length;j++){matches=regex[j].exec(this.getUA());if(!!matches){for(p in props){match=matches[++k];q=props[p];if(typeof q===OBJ_TYPE&&q.length>0){if(q.length==2){if(typeof q[1]==FUNC_TYPE){result[q[0]]=q[1].call(this,match)}else{result[q[0]]=q[1]}}else if(q.length==3){if(typeof q[1]===FUNC_TYPE&&!(q[1].exec&&q[1].test)){result[q[0]]=match?q[1].call(this,match,q[2]):undefined}else{result[q[0]]=match?match.replace(q[1],q[2]):undefined}}else if(q.length==4){result[q[0]]=match?q[3].call(this,match.replace(q[1],q[2])):undefined}}else{result[q]=match?match:undefined}}break}}if(!!matches)break}return result},str:function(str,map){for(var i in map){if(typeof map[i]===OBJ_TYPE&&map[i].length>0){for(var j=0;j<map[i].length;j++){if(util.has(map[i][j],str)){return i===UNKNOWN?undefined:i}}}else if(util.has(map[i],str)){return i===UNKNOWN?undefined:i}}return str}};var maps={browser:{oldsafari:{major:{1:["/8","/1","/3"],2:"/4","?":"/"},version:{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}}},device:{sprint:{model:{"Evo Shift 4G":"7373KT"},vendor:{HTC:"APA",Sprint:"Sprint"}}},os:{windows:{version:{ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2000:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",RT:"ARM"}}}};var regexes={browser:[[/(opera\smini)\/((\d+)?[\w\.-]+)/i,/(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,/(opera).+version\/((\d+)?[\w\.]+)/i,/(opera)[\/\s]+((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/\s(opr)\/((\d+)?[\w\.]+)/i],[[NAME,"Opera"],VERSION,MAJOR],[/(kindle)\/((\d+)?[\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,/(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,/(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,/(rekonq)((?:\/)[\w\.]+)*/i,/(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i],[NAME,VERSION,MAJOR],[/(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i],[[NAME,"IE"],VERSION,MAJOR],[/(yabrowser)\/((\d+)?[\w\.]+)/i],[[NAME,"Yandex"],VERSION,MAJOR],[/(comodo_dragon)\/((\d+)?[\w\.]+)/i],[[NAME,/_/g," "],VERSION,MAJOR],[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/(dolfin)\/((\d+)?[\w\.]+)/i],[[NAME,"Dolphin"],VERSION,MAJOR],[/((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i],[[NAME,"Chrome"],VERSION,MAJOR],[/version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i],[VERSION,MAJOR,[NAME,"Mobile Safari"]],[/version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i],[VERSION,MAJOR,NAME],[/webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i],[NAME,[MAJOR,mapper.str,maps.browser.oldsafari.major],[VERSION,mapper.str,maps.browser.oldsafari.version]],[/(konqueror)\/((\d+)?[\w\.]+)/i,/(webkit|khtml)\/((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/(navigator|netscape)\/((\d+)?[\w\.-]+)/i],[[NAME,"Netscape"],VERSION,MAJOR],[/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,/(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,/(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,/(links)\s\(((\d+)?[\w\.]+)/i,/(gobrowser)\/?((\d+)?[\w\.]+)*/i,/(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,/(mosaic)[\/\s]((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR]],cpu:[[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],[[ARCHITECTURE,"amd64"]],[/((?:i[346]|x)86)[;\)]/i],[[ARCHITECTURE,"ia32"]],[/windows\s(ce|mobile);\sppc;/i],[[ARCHITECTURE,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],[[ARCHITECTURE,/ower/,"",util.lowerize]],[/(sun4\w)[;\)]/i],[[ARCHITECTURE,"sparc"]],[/(ia64(?=;)|68k(?=\))|arm(?=v\d+;)|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],[ARCHITECTURE,util.lowerize]],device:[[/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i],[MODEL,VENDOR,[TYPE,TABLET]],[/(hp).+(touchpad)/i,/(kindle)\/([\w\.]+)/i,/\s(nook)[\w\s]+build\/(\w+)/i,/(dell)\s(strea[kpr\s\d]*[\dko])/i],[VENDOR,MODEL,[TYPE,TABLET]],[/\((ip[honed]+);.+(apple)/i],[MODEL,VENDOR,[TYPE,MOBILE]],[/(blackberry)[\s-]?(\w+)/i,/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola)[\s_-]?([\w-]+)*/i,/(hp)\s([\w\s]+\w)/i,/(asus)-?(\w+)/i],[VENDOR,MODEL,[TYPE,MOBILE]],[/\((bb10);\s(\w+)/i],[[VENDOR,"BlackBerry"],MODEL,[TYPE,MOBILE]],[/android.+((transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+))/i],[[VENDOR,"Asus"],MODEL,[TYPE,TABLET]],[/(sony)\s(tablet\s[ps])/i],[VENDOR,MODEL,[TYPE,TABLET]],[/(nintendo)\s([wids3u]+)/i],[VENDOR,MODEL,[TYPE,CONSOLE]],[/((playstation)\s[3portablevi]+)/i],[[VENDOR,"Sony"],MODEL,[TYPE,CONSOLE]],[/(sprint\s(\w+))/i],[[VENDOR,mapper.str,maps.device.sprint.vendor],[MODEL,mapper.str,maps.device.sprint.model],[TYPE,MOBILE]],[/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,/(zte)-(\w+)*/i,/(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],[VENDOR,[MODEL,/_/g," "],[TYPE,MOBILE]],[/\s((milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?))[\w\s]+build\//i,/(mot)[\s-]?(\w+)*/i],[[VENDOR,"Motorola"],MODEL,[TYPE,MOBILE]],[/android.+\s((mz60\d|xoom[\s2]{0,2}))\sbuild\//i],[[VENDOR,"Motorola"],MODEL,[TYPE,TABLET]],[/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,TABLET]],[/((s[cgp]h-\w+|gt-\w+|galaxy\snexus))/i,/(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,/sec-((sgh\w+))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,MOBILE]],[/(sie)-(\w+)*/i],[[VENDOR,"Siemens"],MODEL,[TYPE,MOBILE]],[/(maemo|nokia).*(n900|lumia\s\d+)/i,/(nokia)[\s_-]?([\w-]+)*/i],[[VENDOR,"Nokia"],MODEL,[TYPE,MOBILE]],[/android\s3\.[\s\w-;]{10}((a\d{3}))/i],[[VENDOR,"Acer"],MODEL,[TYPE,TABLET]],[/android\s3\.[\s\w-;]{10}(lg?)-([06cv9]{3,4})/i],[[VENDOR,"LG"],MODEL,[TYPE,TABLET]],[/((nexus\s4))/i,/(lg)[e;\s-\/]+(\w+)*/i],[[VENDOR,"LG"],MODEL,[TYPE,MOBILE]],[/(mobile|tablet);.+rv\:.+gecko\//i],[TYPE,VENDOR,MODEL]],engine:[[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,/(icab)[\/\s]([23]\.[\d\.]+)/i],[NAME,VERSION],[/rv\:([\w\.]+).*(gecko)/i],[VERSION,NAME]],os:[[/(windows)\snt\s6\.2;\s(arm)/i,/(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],[NAME,[VERSION,mapper.str,maps.os.windows.version]],[/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],[[NAME,"Windows"],[VERSION,mapper.str,maps.os.windows.version]],[/\((bb)(10);/i],[[NAME,"BlackBerry"],VERSION],[/(blackberry)\w*\/?([\w\.]+)*/i,/(tizen)\/([\w\.]+)/i,/(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego)[\/\s-]?([\w\.]+)*/i],[NAME,VERSION],[/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i],[[NAME,"Symbian"],VERSION],[/mozilla.+\(mobile;.+gecko.+firefox/i],[[NAME,"Firefox OS"],VERSION],[/(nintendo|playstation)\s([wids3portablevu]+)/i,/(mint)[\/\s\(]?(\w+)*/i,/(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk)[\/\s-]?([\w\.-]+)*/i,/(hurd|linux)\s?([\w\.]+)*/i,/(gnu)\s?([\w\.]+)*/i],[NAME,VERSION],[/(cros)\s[\w]+\s([\w\.]+\w)/i],[[NAME,"Chromium OS"],VERSION],[/(sunos)\s?([\w\.]+\d)*/i],[[NAME,"Solaris"],VERSION],[/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i],[NAME,VERSION],[/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i],[[NAME,"iOS"],[VERSION,/_/g,"."]],[/(mac\sos\sx)\s?([\w\s\.]+\w)*/i],[NAME,[VERSION,/_/g,"."]],[/(haiku)\s(\w+)/i,/(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,/(macintosh|mac(?=_powerpc)|plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos)/i,/(unix)\s?([\w\.]+)*/i],[NAME,VERSION]]};var UAParser=function(uastring){var ua=uastring||(window&&window.navigator&&window.navigator.userAgent?window.navigator.userAgent:EMPTY);if(!(this instanceof UAParser)){return new UAParser(uastring).getResult()}this.getBrowser=function(){return mapper.rgx.apply(this,regexes.browser)};this.getCPU=function(){return mapper.rgx.apply(this,regexes.cpu)};this.getDevice=function(){return mapper.rgx.apply(this,regexes.device)};this.getEngine=function(){return mapper.rgx.apply(this,regexes.engine)};this.getOS=function(){return mapper.rgx.apply(this,regexes.os)};this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}};this.getUA=function(){return ua};this.setUA=function(uastring){ua=uastring;return this};this.setUA(ua)};if(typeof exports!==UNDEF_TYPE){if(typeof module!==UNDEF_TYPE&&module.exports){exports=module.exports=UAParser}exports.UAParser=UAParser}else{window.UAParser=UAParser;if(typeof define===FUNC_TYPE&&define.amd){define(function(){return UAParser})}if(typeof window.jQuery!==UNDEF_TYPE){var $=window.jQuery;var parser=new UAParser;$.ua=parser.getResult();$.ua.get=function(){return parser.getUA()};$.ua.set=function(uastring){parser.setUA(uastring);var result=parser.getResult();for(var prop in result){$.ua[prop]=result[prop]}}}}}(this);return function(){return new UAParser}}();raphaelDOM.Rect=function(){var _degree_to_radian=Math.PI/180;window._f=function _f(n){return Math.round(n*10)/10};var _string=_.template("x: <%= _f(left) %> ... <%= _f(right) %>(<%= _f(width) %>), y: <%= _f(top) %> ... <%= _f(bottom) %>(<%= _f(height) %>)");function Rect(left,top,width,height){this.init(left,top,width,height)}Rect.prototype={TYPE:"RECT",init:function(left,top,width,height){if(_.isObject(left)){this.init(left.left,left.top,left.width||0,left.height||0);if(!left.hasOwnProperty("width")&&left.hasOwnProperty("bottom")){this.bottom=left.bottom;this._recalcHeight()}if(!left.hasOwnProperty("height")&&left.hasOwnProperty("right")){this.right=left.right;this._recalcWidth()}}else{this.left=left;this.top=top;this.width=width;this.height=height;this.right=left+width;this.bottom=top+height}this.validate()},center:function(){return{x:this.left+this.width/2,y:this.top+this.height/2}},radius:function(mode){switch(mode){case"max":return Math.max(this.width,this.height)/2;break;case"mean":return(this.width,this.height)/4;break;case"min":default:return Math.min(this.width,this.height)/2}},radialPoint:function(angle,mode,radiusScale){var radius=this.radius(mode);if(arguments.length<3)radiusScale=1;var r=radius*radiusScale;var center=this.center();center.x+=r*Math.cos(-angle*_degree_to_radian);center.y+=r*Math.sin(-angle*_degree_to_radian);return center},validate:function(){if(_.any(["left","right","top","bottom","height","width"],function(field){return isNaN(this[field])},this)){throw new Error("invalid rect: "+this.toString())}},toString:function(){return _string(this)},intersect:function(rect){var r2=new raphaelDOM.Rect({left:Math.max(this.left,rect.left),right:Math.min(this.right,rect.right),top:Math.max(this.top,rect.top),bottom:Math.min(this.bottom,rect.bottom)});r2.validate();return r2},inset:function(inset){inset=_.isObject(inset)?inset:{value:inset};var left=raphaelDOM.utils.getProp(inset,"left","width","value");var right=raphaelDOM.utils.getProp(inset,"right","width","value");var top=raphaelDOM.utils.getProp(inset,"top","height","value");var bottom=raphaelDOM.utils.getProp(inset,"bottom","height","value");return this._inset(left,top,right,bottom)},outset:function(outset){outset=_.isObject(outset)?outset:{value:outset};outset.value|=0;var left=raphaelDOM.utils.getProp(outset,"left","width","value");var right=raphaelDOM.utils.getProp(outset,"right","width","value");var top=raphaelDOM.utils.getProp(outset,"top","height","value");var bottom=raphaelDOM.utils.getProp(outset,"bottom","height","value");return this._outset(left,top,right,bottom)},clone:function(){return new raphaelDOM.Rect(this)},_inset:function(l,t,r,b){var rect=this.clone();l=raphaelDOM.utils.scale(l,this.width);r=raphaelDOM.utils.scale(r,this.width);t=raphaelDOM.utils.scale(t,this.height);b=raphaelDOM.utils.scale(b,this.height);rect.left+=l;rect.right-=r;rect.top+=t;rect.bottom-=b;rect._recalcWidth();rect._recalcHeight();return rect},_outset:function(l,t,r,b){var rect=this.clone();rect.left-=l;rect.right+=r;rect.top-=t;rect.bottom+=b;rect._recalcWidth();rect._recalcHeight();return rect},recalculate:function(){this._recalcWidth();this._recalcHeight()},_recalcWidth:function(){this.width=this.right-this.left},_recalcHeight:function(){this.height=this.bottom-this.top},frameInMe:function(rect,align){var offsetLeft,offsetTop;var widthDiff=this.width-rect.width;var heightDiff=this.height-rect.height;switch(align){case"TL":offsetLeft=this.left;offsetTop=this.top;break;case"T":offsetLeft=widthDiff/2;offsetTop=this.top;break;case"TR":offsetLeft=this.right-rect.width;offsetTop=this.top;break;case"L":offsetLeft=this.left;offsetTop=this.top;break;case"C":offsetLeft=widthDiff/2;offsetTop=heightDiff/2;break;case"R":offsetLeft=this.right-rect.width;offsetTop=this.top;break;case"BL":offsetLeft=this.left;offsetTop=this.bottom-rect.height;break;case"B":offsetLeft=widthDiff/2;offsetTop=this.bottom-rect.height;break;case"BR":offsetLeft=this.right-rect.width;offsetTop=this.bottom-rect.height;break;default:throw new Error("bad anchor"+align)}return rect.offset(offsetLeft,offsetTop)},offset:function(x,y){var rect=this.clone();rect.left+=x;rect.right+=x;rect.top+=y;rect.bottom+=y;return rect}};return Rect}();raphaelDOM.Box=function(){var _rgb=_.template("rgb(<%= red %>,<%= green %>, <%= blue %>)");var _hsl=_.template("hsl(<%= hue %>, <%= sat %>%, <%= light %>%)");var _DEBUG_UNDRAW=true;function _addSVGclass(node,klass){var det=raphaelDOM.browserDetect();if(!(det.browser=="Explorer"&&det.browser.version<=8)){return node.node.setAttribute("class",klass)}}var box_id=0;function Box(name,params,parent,paper){this.anchor="TL";this.margin=0;this.padding=0;this.width="100%";this.height="100%";this.rows=1;this.cols=1;this.id=++box_id;this.drawType="rect";this.color={red:0,green:0,blue:0};this.strokeColor={red:0,green:0,blue:0};this.colorMode="rgb";this.drawAttrs={};if(params)_.extend(this,params);this.name=name;this._children=[];this.parent=parent;this.paper=paper||(parent?parent.paper:null);this.marginDim=new raphaelDOM.Dimension(this.margin);this.paddingDim=new raphaelDOM.Dimension(this.padding)}Box.prototype={TYPE:"raphaelDOM.BOX",is_root:function(){return this.parent instanceof jQuery||!(this.parent.TYPE=="raphaelDOM.BOX")},parentRect:function(){if(this.is_root()){return new raphaelDOM.Rect(0,0,this.parent.width(),this.parent.height())}else{return this.parent.rect(true)}},setPaper:function(paper){this.paper=paper;_.each(this._children,function(c){c.setPaper(paper)})},getPath:function(){var out="";if(this.parent&&this.parent.getPath){out+=this.parent.getPath()+"."}out+=(this.name||"<unnamed>")+"#"+this.id;return out},rect:function(inner){var parentRect=this.parentRect();var marginRect=parentRect.inset(this.marginDim);var width=raphaelDOM.utils.scale(this.width,parentRect.width);var height=raphaelDOM.utils.scale(this.height,parentRect.height);var left,top;var diffWidth=marginRect.width-width;var diffHeight=marginRect.height-height;switch(this.anchor){case"TL":left=marginRect.left;top=marginRect.top;break;case"TR":left=marginRect.right-width;top=marginRect.top;break;case"T":left=marginRect.left+diffWidth/2;top=marginRect.top;break;case"L":left=marginRect.left;top=marginRect.top+diffHeight/2;break;case"C":left=marginRect.left+diffWidth/2;top=marginRect.top+diffHeight/2;break;case"R":left=marginRect.right-width;top=marginRect.top+diffHeight/2;break;case"BL":left=marginRect.left;top=marginRect.bottom-height;break;case"BR":left=marginRect.right-width;top=marginRect.bottom-height;break;case"B":left=marginRect.left+(marginRect.width-width)/2;top=marginRect.bottom-height;break;default:throw new Error("bad anchor"+this.anchor)}var rect=new raphaelDOM.Rect(left,top,width,height);return inner?rect.inset(this.paddingDim):rect},child:function(name,attrs){var child=new Box(name||this.name+" child "+this._children.length,attrs||{},this);this._children.push(child);return child},setWidth:function(width){this.width=width;return this},setHeight:function(height){this.height=height;return this},setAnchor:function(a){this.anchor=_.reduce({top:"T",left:"L",right:"R",bottom:"B"},function(a,shortName,longName){return a.replace(longName,shortName)},a).replace(/[^TLCBR]/g,"");return this},getTitle:function(){return this.hasOwnProperty("title")?this.title:""},setPadding:function(p){this.paddingDim=new raphaelDOM.Dimension(p);return this},setTopPadding:function(m){this.paddingDim.top=m;return this},setBottomPadding:function(m){this.paddingDim.bottom=m;return this},setLeftPadding:function(m){this.paddingDim.left=m;return this},setRightPadding:function(m){this.paddingDim.right=m;return this},getDrawAttrs:function(){this._computeFill();if(this.drawAttrs["stroke-width"]){this._computeStroke()}return _.extend({"stroke-width":0,fill:"black"},this.drawAttrs||{})},setMargin:function(p){this.marginDim=new raphaelDOM.Dimension(p);return this},setTopMargin:function(m){this.marginDim.top=m;return this},setBottomMargin:function(m){this.marginDim.bottom=m;return this},setLeftMargin:function(m){this.marginDim.left=m;return this},setRightMargin:function(m){this.marginDim.right=m;return this},_computeFill:function(){if(this.color&&_.isObject(this.color)){switch(this.colorMode){case"rgb":this.drawAttrs.fill=_rgb(this.color);break;case"hsl":this.drawAttrs.fill=_hsl(this.color);break}}},_computeStroke:function(){if(this.strokeColor&&_.isObject(this.strokeColor)){switch(this.colorMode){case"rgb":this.drawAttrs.stroke=_rgb(this.strokeColor);break;case"hsl":this.drawAttrs.stroke=_hsl(this.strokeColor);break}}},setColor:function(r,g,b){this.color.red=r;this.color.green=g;this.color.blue=b;return this},setStrokeColor:function(r,g,b){this.strokeColor.red=r;this.strokeColor.green=g;this.strokeColor.blue=b;return this},setDrawType:function(type){if(!raphaelDOM.draw.hasOwnProperty(type)){throw new Error("bad draw type "+type)}this.drawType=type;return this},undraw:function(){if(_DEBUG_UNDRAW){console.log("undrawing ",this.name,"element",this.element)}if(this.element){this.element.attr("opacity",0);this.element.hide();this.element.remove();delete this.element}else{if(_DEBUG_UNDRAW)console.log(" ... no element to undraw")}this._drawn=false;_.each(this._children,function(child){child.undraw()})},draw:function(paper){console.log("drawing ",this.getPath());if(this._drawn){console.log("attempt to draw ",this.getPath()," twice");return}if(paper){this.paper=paper}this._computeFill();if(this.drawAttrs["stroke-width"]){this._computeStroke()}if(raphaelDOM.draw[this.drawType]){raphaelDOM.draw[this.drawType](this)}else{throw new Error("cannot find drawType "+this.drawType)}if(this.element&&!this.noCrisp){_addSVGclass(this.element,"crispEdges")}this._drawn=true;_.each(this._children,function(child){child.draw(this.paper)},this)}};return Box}();raphaelDOM.draw.text=function(box){var _DEBUG=false;var rect=box.rect();var fontHeight=box.drawAttrs["font-size"]||12;box.drawAttrs["font-size"]=fontHeight;var bigHeightDiff=rect.height-fontHeight;fontHeight*=.6;var heightDiff=rect.height-fontHeight;var textPos,paper=box.paper;switch(box.anchor){case"TL":box.element=paper.text(rect.left,rect.top+fontHeight,box.text);textPos="start";break;case"T":box.element=paper.text(rect.left+rect.width/2,rect.top+fontHeight,box.text);textPos="middle";break;case"TR":box.element=paper.text(rect.right,rect.top+fontHeight,box.text);textPos="end";break;case"L":box.element=paper.text(rect.left,rect.top+(fontHeight+heightDiff)/2,box.text);textPos="start";break;case"C":box.element=paper.text(rect.left+rect.width/2,rect.top+(fontHeight+heightDiff)/2,box.text);textPos="middle";break;case"R":box.element=paper.text(rect.right,rect.top+(fontHeight+heightDiff)/2,box.text);textPos="end";break;case"BL":box.element=paper.text(rect.left,rect.bottom-fontHeight,box.text);textPos="start";break;case"B":box.element=paper.text(rect.left+rect.width/2,rect.bottom-fontHeight,box.text);textPos="middle";break;case"BR":box.element=paper.text(rect.right,rect.bottom-fontHeight,box.text);textPos="end";break;default:throw new Error("no anchor "+box.anchor)}box.drawAttrs["text-anchor"]=textPos;box.element.attr(box.getDrawAttrs())};raphaelDOM.draw.circle=function(){var _DEBUG=false;var rad=Math.PI/180;function _circle(box){var rect=box.rect();var center=rect.center();var r=rect.radius(box.radMode||"");return box.paper.circle(center.x,center.y,r)}return function(box){var _DEBUG=false;var rect=box.rect();box.element=_circle(box);if(_DEBUG)console.log("circle: ",box.name,":",box,"rect: ",rect);box.element.attr(_.extend({"stroke-width":0,fill:"black",title:box.getTitle()},box.drawAttrs||{}))}}();raphaelDOM.draw.wedge=function(){function _sector(box){var rect=box.rect();var center=rect.center();var r=rect.radius();var startAngle=box.hasOwnProperty("startAngle")?box.startAngle:0,endAngle=box.hasOwnProperty("endAngle")?box.endAngle:360;var p1=rect.radialPoint(startAngle);var p2=rect.radialPoint(endAngle);return box.paper.path(["M",center.x,center.y,"L",p1.x,p1.y,"A",r,r,0,+(endAngle-startAngle>180),0,p2.x,p2.y,"z"])}return function(box){var _DEBUG=false;var rect=box.rect();box.element=_sector(box);if(_DEBUG)console.log("box: ",box.name,":",box,"rect: ",rect);box.element.attr(_.extend({"stroke-width":0,fill:"black",title:box.getTitle()},box.drawAttrs||{}))}}();raphaelDOM.draw.rect=function(){var _DEBUG=true;return function(box){var rect=box.rect();box.element=box.paper.rect(rect.left,rect.top,rect.width,rect.height);box.element.attr(box.getDrawAttrs());if(_DEBUG)console.log("drawing ",box.getPath())}}();raphaelDOM.draw.grid=function(paper){var _DEBUG=false;var _cell_name_template=_.template("<%= name %> row <%= row %> column <%= column %>");return function(box){var rect=box.rect(true);var cell_name_template=box.cell_name_template||_cell_name_template;var columns=Math.floor(box.columns)||1;var columnMargin=box.columnMargin||0;var columnMarginWidth=columnMargin?raphaelDOM.utils.scale(columnMargin,rect.width):0;var columnsWidth=rect.width-(columns-1)*columnMarginWidth;var columnWidth=columnsWidth/columns;var rows=Math.floor(box.rows)||1;var rowMargin=box.rowMargin||0;var rowMarginHeight=rowMargin?raphaelDOM.utils.scale(rowMargin,rect.height):0;var rowsHeight=rect.height-(rows-1)*rowMarginHeight;var rowHeight=rowsHeight/rows;if(_DEBUG)console.log("grid specs: ",{columns:columns,columnMargin:columnMargin,columnWidth:columnWidth,rows:rows,rowMargin:rowMargin,rowHeight:rowHeight});box._children=[];var totalColumnLeftMargin=0;_.each(_.range(0,columns),function(column){var params={column:column,columns:columns,rows:rows,columnWidth:columnWidth,columnMarginWidth:columnMarginWidth,rect:rect};var width=box.setColumnWidth?box.setColumnWidth(params):columnWidth;params.width=width;var columnLeftMargin=box.setColumnMargin?box.setColumnMargin(params):columnMarginWidth;var totalRowTopMargin=0;_.each(_.range(0,rows),function(row){params={row:row,columns:columns,rows:rows,rowHeight:rowHeight,rect:rect,rowMarginHeight:rowMarginHeight};var height=box.setRowHeight?box.setRowHeight(params):rowHeight;params.height=height;var rowTopMargin=box.setRowMargin?box.setRowMargin(params):rowMarginHeight;var cell=box.child(cell_name_template({name:box.name,row:row,column:column})).setLeftMargin(totalColumnLeftMargin).setTopMargin(totalRowTopMargin).setWidth(width).setHeight(height).setDrawType("rect");if(box.processCell){box.processCell(cell,column,row)}if(_DEBUG||box.debug){console.log("cell ",cell.getTitle(),"  rect: ",cell.rect().toString())}totalRowTopMargin+=height+rowTopMargin});totalColumnLeftMargin+=columnLeftMargin+width})}}();