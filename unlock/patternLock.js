require('./jquery-1.9.1.min.js');
(function () {
    var isTouchSupported = !! ('ontouchstart' in window),
        touchStart = isTouchSupported ? "touchstart" : "mousedown",
        touchEnd = isTouchSupported ? "touchend" : "mouseup",
        touchMove = isTouchSupported ? "touchmove" : "mousemove",
        nullFunc = function () {},
        objectHolder = {};
        console.log(isTouchSupported);//pc端为false
        console.log(touchStart, touchEnd);
    var a=[];
    var b=[];
    var thisInput;
    //internal functions 创建一个X x Y 的解锁区域
    function readyDom(iObj) {
        //console.log(iObj);
        var holder = iObj.holder,//主容器div
            option = iObj.option,
            matrix = option.matrix,
            margin = option.margin,
            radius = option.radius;
        
        html = ['<ul class="patt-wrap" style="padding:' + margin + 'px">'];
        for (var i = 0, ln = matrix[0] * matrix[1]; i < ln; i++) {
            html.push('<li class="patt-circ" style="margin:' + margin + 'px; width : ' + (radius * 2) + 'px; height : ' + (radius * 2) + 'px; -webkit-border-radius: ' + radius + 'px; -moz-border-radius: ' + radius + 'px; border-radius: ' + radius + 'px; "><div class="patt-dots"></div></li>');
        }
        html.push('</ul>');
        holder.html(html.join('')).css({
            'width': (matrix[1] * (radius * 2 + margin * 2) + margin * 2) + 'px',
            'height': (matrix[0] * (radius * 2 + margin * 2) + margin * 2) + 'px'
        });
        html.push('<div id="txt"></div>');
        html.push('<div class="choose" id="password"><label><input id="password" name="pass" type="radio" />设置密码</label></div>');
        html.push('<div class="choose" id="confirm"><label><input id="confirm" name="pass" type="radio" />验证密码</label></div>');
        holder.html(html.join(''));

        var choose = document.querySelectorAll('.choose');
        console.log(choose);
        thisInput = document.getElementsByTagName('input');
        for(var i=0,len = choose.length;i<len;i++){
            choose[i].onclick = function(){
                if(i == 1){
                    document.getElementById('password').click();
                }else{
                    document.getElementById('confirm').click();
                }
                $("#txt").html("请输入手势密码");
            }
        }
        /*for(var i=0,len = thisInput.length;i<len;i++){
            if(thisInput[0].checked == true || thisInput[1].checked == true){
               $("#txt").html("请输入手势密码");
            }
        }*/
        
        

        //select pattern circle
        iObj.pattCircle = iObj.holder.find('.patt-circ');//每一个小按钮

    }

    //return height and angle for lines
    function getLengthAngle(x1, x2, y1, y2) {
        var xDiff = x2 - x1,
            yDiff = y2 - y1

        return {
            length: Math.ceil(Math.sqrt(xDiff * xDiff + yDiff * yDiff)),//斜边长
            angle: Math.round((Math.atan2(yDiff, xDiff) * 180) / Math.PI)//返回x轴正方向逆时针旋转到直线的角度
        }
    }



    var startHandler = function (e, obj) {
        e.preventDefault();
        //console.log(objectHolder[obj.token]);
		var iObj = objectHolder[obj.token];
        //check if pattern is visible or not
        if (!iObj.option.patternVisible) {
            iObj.holder.addClass('patt-hidden');
        }
        document.getElementById("txt").innerHTML="";
        //assign events
        if(thisInput[0].checked == true || thisInput[1].checked == true){
           $("#txt").html("请输入手势密码");
           obj.reset();
           $(this).on(touchMove + '.pattern-move', function (e) {
                moveHandler.call(this, e, obj);
            });
        }
        
        $(document).one(touchEnd, function () {//添加只触发一次的事件
            endHandler.call(this, e, obj);
        });
        //set pattern offset
        var wrap = iObj.holder.find('.patt-wrap'),//ul
            offset = wrap.offset();//获得偏移
        iObj.wrapTop = offset.top,
        iObj.wrapLeft = offset.left;

        //reset pattern
        obj.reset();

    },
        moveHandler = function (e, obj) {
	        e.preventDefault();
            var x = e.pageX || e.originalEvent.touches[0].pageX,//pageX为可见区域，originalEvent包括滚动条
                y = e.pageY || e.originalEvent.touches[0].pageY,
                iObj = objectHolder[obj.token],
                li = iObj.pattCircle,
                patternAry = iObj.patternAry,
                lineOnMove = iObj.option.lineOnMove,
                posObj = iObj.getIdxFromPoint(x, y),
                idx = posObj.idx,//当前经过第ul中 idx 个 li
                pattId = iObj.mapperFunc(idx) || idx;

            //点与当前拖动点之间划线 
            if (patternAry.length > 0) {
                var laMove = getLengthAngle(iObj.lineX1, posObj.x, iObj.lineY1, posObj.y);
                iObj.line.css({
                    'width': (laMove.length - 5) + 'px',
                    'transform': 'rotate(' + laMove.angle + 'deg)'
                });
            }

            if (idx) {
                if (patternAry.indexOf(pattId) == -1) {
                    var elm = $(li[idx - 1]);
                    elm.addClass('hovered');//标记已经过的li为hovered
                    //push pattern on array
                    patternAry.push(pattId);

                    //add start point for line
                    var margin = iObj.option.margin,
                        radius = iObj.option.radius,
                        newX = (posObj.i - 1) * (2 * margin + 2 * radius) + 2 * margin + radius;
                    newY = (posObj.j - 1) * (2 * margin + 2 * radius) + 2 * margin + radius;

                    console.log(iObj.sign);
                    if(iObj.sign == 1){
                        b.push({x:newX,y:newY});
                        console.log(b);
                    }
                    else{
                        a.push({x:newX,y:newY});
                        console.log(a);
                    }

                    if (patternAry.length != 1) {
                        //to fix line
                        var lA = getLengthAngle(iObj.lineX1, newX, iObj.lineY1, newY);
                        iObj.line.css({
                            'width': (lA.length + 5) + 'px',
                            'transform': 'rotate(' + lA.angle + 'deg)'
                        });

                        if (!lineOnMove) iObj.line.show();
                    }

                    //to create new line
                    var line = $('<div class="patt-lines" style="top:' + (newY - 2.5) + 'px; left:' + (newX - 2.5) + 'px"></div>');
                    iObj.line = line;
                    iObj.lineX1 = newX;
                    iObj.lineY1 = newY;
                    //add on dom
                    iObj.holder.append(line);
                    if (!lineOnMove) iObj.line.hide();
                }
            }

        },
        endHandler = function (e, obj) {
	        e.preventDefault();
            var iObj = objectHolder[obj.token],
                li = iObj.pattCircle,
                pattern = iObj.patternAry.join('');
            
            //remove hidden pattern class and remove event
            iObj.holder.off('.pattern-move').removeClass('patt-hidden');
			
			if(!pattern) return;
			
			iObj.option.onDraw(pattern);

            //to remove last line
            iObj.line.remove();

            console.log(a.length);

            if(thisInput[0].checked == true){
               if(a.length < 5){
                    iObj.sign=0;
                    console.log("hhhhhhhh"+iObj.sign);
                    a=[];
                    //document.getElementById("txt").innerHTML="密码太短，至少需要5个点";
                    $("#txt").html("密码太短，至少需要5个点");
                    obj.reset();
                    return;
                }
                else if(a.length >= 5){
                    if(b.length > 0){
                        if(a.length == b.length){
                            for (var i = 0; i < a.length; i++) {
                                if(a[i].x != b[i].x || a[i].y != b[i].y){
                                    a=[];
                                    b=[];
                                    $("#txt").html("两次输入的不一致");
                                    obj.reset();
                                    iObj.sign=0;
                                    return;
                                }
                            };
                            document.getElementById("txt").innerHTML="密码设置成功";

                            localStorage[name]= JSON.stringify(a);
                            console.log(localStorage[name]);
                            a=[];
                            b=[];
                            iObj.sign=0;
                        }
                        else{
                            a=[];
                            b=[];
                            iObj.sign=0;
                            document.getElementById("txt").innerHTML="两次输入的不一致";
                            obj.reset();
                        }
                    }
                    else{
                        iObj.sign=1;
                        console.log("hhhhhhhh"+iObj.sign);
                        document.getElementById("txt").innerHTML="请再次输入手势密码";
                        obj.reset();
                    }
                }
            }
            else if(thisInput[1].checked == true){
               if(a.length < 5){
                    $("#txt").html("输入的密码不正确");
                    obj.reset();
                    iObj.sign=0;
                    a=[];
                }
                else if(a.length >= 5){
                    var local = JSON.parse(localStorage[name]);
                    console.log(local);
                    if(a.length == local.length){
                        for (var i = 0; i < a.length; i++) {
                            if(a[i].x != local[i].x || a[i].y != local[i].y){
                                a=[];
                                b=[];
                                document.getElementById("txt").innerHTML="输入的密码不正确";
                                obj.reset();
                                iObj.sign=0;
                                return;
                            }
                        };
                        document.getElementById("txt").innerHTML="密码正确！";

                        localStorage[name]= JSON.stringify(a);
                        console.log(localStorage[name]);
                        a=[];
                        b=[];
                        iObj.sign=0;
                    }
                    else{
                        a=[];
                        b=[];
                        iObj.sign=0;
                        document.getElementById("txt").innerHTML="输入的密码不正确";
                        obj.reset();
                    }
                }
            }
            if (iObj.rightPattern) {
                if (pattern == iObj.rightPattern) {
                    iObj.onSuccess();
                } else {
                    iObj.onError();
                    obj.error();
                }
            }
        };

    function InternalMethods() {};

    InternalMethods.prototype = {
        constructor: InternalMethods,
        getIdxFromPoint: function (x, y) {
            var option = this.option,
                matrix = option.matrix,
                xi = x - this.wrapLeft,
                yi = y - this.wrapTop,
                idx = null,
                margin = option.margin,
                plotLn = option.radius * 2 + margin * 2;
            qsntX = Math.ceil(xi / plotLn),
            qsntY = Math.ceil(yi / plotLn),
            remX = xi % plotLn,
            remY = yi % plotLn;

            if (qsntX <= matrix[1] && qsntY <= matrix[0] && remX > margin * 2 && remY > margin * 2) {
                idx = (qsntY - 1) * matrix[1] + qsntX;
            }
            return {
                idx: idx,
                i: qsntX,
                j: qsntY,
                x: xi,
                y: yi
            };
        }
    }

    function PatternLock(selector, option) {
        var self = this,
            token = self.token = Math.random(),
            iObj = objectHolder[token] = new InternalMethods(),
            holder = iObj.holder = $(selector);

        //if holder is not present return
        if (holder.length == 0) return;

        iObj.object = self;
        option = iObj.option = $.extend({}, PatternLock.defaults, option);
        readyDom(iObj);


        //add class on holder
		holder.addClass('patt-holder');
		
		//change offset property of holder if it does not have any property
        if (holder.css('position') == "static") holder.css('position', 'relative');

        //assign event
        holder.on(touchStart, function (e) {
            startHandler.call(this, e, self);
        });

        //handeling callback
        iObj.option.onDraw = option.onDraw || nullFunc;

        //adding a mapper function	
        var mapper = option.mapper;
        if (typeof mapper == "object") {
            iObj.mapperFunc = function (idx) {
                return mapper[idx];
            }
        } else if (typeof mapper == "function") {
            iObj.mapperFunc = mapper;
        } else {
            iObj.mapperFunc = nullFunc;
        }

        //to delete from option object
        iObj.option.mapper = null;
    }

    PatternLock.prototype = {
        constructor: PatternLock,
        option: function (key, val) {
            var iObj = objectHolder[this.token],
                option = iObj.option;
            //for set methods
            if (!val) {
                return option[key];
            }
            //for setter
            else {
                option[key] = val;
                if (key == "margin" || key == "matrix" || key == "radius") {
                    readyDom(iObj);
                }
            }
        },
        getPattern: function () {
            return objectHolder[this.token].patternAry.join('');
        },
        reset: function () {
            var iObj = objectHolder[this.token];
            //to remove lines
            iObj.pattCircle.removeClass('hovered');
            iObj.holder.find('.patt-lines').remove();

            //add/reset a array which capture pattern
            iObj.patternAry = [];

            //remove error class if added
            iObj.holder.removeClass('patt-error');

        },
        error: function () {
            objectHolder[this.token].holder.addClass('patt-error');
        },
        checkForPattern: function (pattern, success, error) {
            var iObj = objectHolder[this.token];
            iObj.rightPattern = pattern;
            iObj.onSuccess = success || nullFunc;
            iObj.onError = error || nullFunc;
        }
    }


    PatternLock.defaults = {
        matrix: [3, 3],
        margin: 20,
        radius: 25,
        patternVisible: true,
        lineOnMove: true
    };


    window.PatternLock = PatternLock;
}());