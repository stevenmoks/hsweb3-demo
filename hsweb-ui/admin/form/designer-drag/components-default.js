(function () {

    function createDefaultEditor() {
        return [
            {
                id: "name",
                editor: "textbox",
                text: "字段",
                value: ""
            }, {
                id: "comment",
                editor: "textbox",
                text: "描述",
                value: "新建控件"
            }, createTrueOrFalseEditor("showComment", "显示描述", "true"), {
                id: "emptyText",
                text: "提示",
                value: ""
            }, {
                id: "type",
                editor: "textbox",
                text: "控件类型",
                createEditor: function (component, text, value, call) {
                    value = value || component.type;
                    var html = $("<input name='type' allowInput=\"true\" expandOnLoad='true'  style='width: 100%' class='mini-treeselect'>");
                    html.val(value);
                    if (!window.__components) {
                        window.__components = [];
                        var cache = {};
                        $(componentRepo.supportComponentsList)
                            .each(function () {
                                if (!cache[this.type]) {
                                    cache[this.type] = {id: this.type, text: this.type};
                                    cache[this.type].children = [];
                                }
                                var tmp = new this();
                                cache[this.type].children.push({id: tmp.type, text: tmp.getProperty("comment").value});
                            });
                        for (var type in cache) {
                            window.__components.push(cache[type])
                        }
                    }

                    window.onbeforenodeselect_00001 = function (e) {
                        if (e.isLeaf === false) e.cancel = true;
                    };
                    html.attr({
                        "data": " window.__components",
                        "onbeforenodeselect": "onbeforenodeselect_00001"
                    });
                    return html;
                }
            }, {
                id: "size",
                text: "控件宽度",
                value: "4",
                createEditor: function (component, text, value, call) {
                    var html = $("<div style='margin-left: 4px;position: relative;top: 9px;width: 92%'>");
                    html.slider({
                        orientation: "horizontal",
                        range: "min",
                        min: 1,
                        max: 12,
                        value: value,
                        slide: function () {
                            if (call) call()
                            component.setProperty("size", arguments[1].value);
                        }
                    });
                    return html;
                }
            },
            {
                id: "required",
                editor: "radio",
                text: "是否必填",
                value: "undefined",
                createEditor: function (component, text, value) {
                    var checkbox = $("<input class='mini-radiobuttonlist' name='required' value='" + value + "'>");

                    checkbox.attr("data", JSON.stringify([{id: "required", text: "是"}, {id: 'undefined', checked: true, text: "否"}]));
                    return checkbox;
                }
            }
        ];
    }

    function createClass(O, T, name) {
        (function () {
            // 创建一个没有实例方法的类
            var Super = function () {
            };
            Super.prototype = T ? T.prototype : Component.prototype;
            //将实例作为子类的原型
            O.prototype = new Super();
            O.type = name || "基础控件";
        })();
    }

    function createDataSourceEditor() {
        return {
            id: "option",
            text: "选项配置",
            value: {
                type: "data",
                data: [{id: "1", text: '选项1'}, {id: "2", text: '选项2'}]
            },
            createEditor: function (component, text, value) {
                var button = $("<a class='mini-button' plain='true' onclick='edit_datasource_00001' iconCls='icon-edit'>");
                window.edit_datasource_00001 = function () {
                    editOptional(component.getProperty("option").value, component.type, function (config) {
                        component.setProperty("option", mini.clone(config));
                        mini.parse();
                    });
                };
                return button;
            }

        }
    }

    function createScriptEditor(id, text, lang) {
        return {
            id: id,
            text: text,
            script: true,
            value: "",
            createEditor: function (component, text, value) {
                var button = $("<a class='mini-button' plain='true' onclick='window.edit_script_" + id + "' iconCls='icon-edit'>");
                window['edit_script_' + id] = function () {
                    editScript(lang, component.getProperty(id).value || "", null, function (editor) {
                        component.setProperty(id, editor.getScript());
                        mini.parse();
                    });
                };
                return button;
            }

        }
    }

    function createTrueOrFalseEditor(id, text, value) {
        return {
            id: id,
            text: text,
            value: value,
            createEditor: function (component, text, value) {
                var checkbox = $("<input class='mini-radiobuttonlist' name='" + id + "' value='" + value + "'>");
                checkbox.attr("data", JSON.stringify([{id: "true", text: "是"}, {id: 'false', checked: true, text: "否"}]));
                return checkbox;
            }
        }
    }

    function createOtherElEditor(options) {
        return {
            id: "elProperties",
            text: "其他配置",
            value: {},
            createEditor: function (component, text, value) {
                var button = $("<a class='mini-button' plain='true' onclick='elProperties_00001' iconCls='icon-edit'>");
                window.elProperties_00001 = function () {

                };
                return button;
            }

        }
    }

    /**基础组件**/
    {
        /**fieldset**/
        {
            function FieldSet(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.removeProperty("placeholder");
                this.removeProperty("name");
                this.removeProperty("required");
                this.getProperty("comment").value = "分割";
                this.getProperty("size").value = "12";
            }

            createClass(FieldSet);

            FieldSet.prototype.render = function () {
                var container = this.getContainer(function () {
                    var m = $("<div class='mini-col-12 form-component'>");
                    var c = $("<fieldset style='border:0px; border-top: 1px solid #ddd;height: 100%' class=\"brick\">");
                    var label = $("<legend style='font-size: 20px'>").text("分割");
                    c.append(label);
                    m.append(c);
                    return m;
                });
                this.un("propertiesChanged")
                    .on('propertiesChanged', function (key, value) {
                        if (key === 'comment') {
                            container.find("legend").text(value);
                        } else if (key === 'emptyText') {
                            container.find("legend").attr("title", value);
                        } else {
                            container.find("legend").attr(key, value);
                        }
                    });
                return container;
            };

            componentRepo.registerComponent("fieldset", FieldSet);
        }
        /**文本**/
        {
            function Text(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.removeProperty("placeholder");
                this.removeProperty("name");
                this.removeProperty("required");
                this.removeProperty("emptyText");
                this.removeProperty("showComment");
                this.getProperty("comment").value = "文本标签";
                this.getProperty("size").value = "1";
                this.properties.push(
                    {
                        id: "bodyHeight",
                        text: "高度",
                        value: 1,
                        createEditor: function (component, text, value, call) {
                            if (!value) {
                                value = 1;
                            }
                            var html = $("<div style='margin-left: 4px;position: relative;top: 9px;width: 92%'>");
                            html.slider({
                                orientation: "horizontal",
                                range: "min",
                                min: 1,
                                max: 200,
                                value: parseInt(value),
                                slide: function () {
                                    if (call) call();
                                    var val = parseInt(arguments[1].value);
                                    component.setProperty("bodyHeight", val <= 2 ? "" : val);
                                }
                            });
                            return html;
                        }
                    }
                );
                this.properties.push(
                    {
                        id: "fontSize",
                        text: "字体大小",
                        value: 14,
                        createEditor: function (component, text, value, call) {
                            if (!value) {
                                value = 1;
                            }
                            var html = $("<div style='margin-left: 4px;position: relative;top: 9px;width: 92%'>");
                            html.slider({
                                orientation: "horizontal",
                                range: "min",
                                min: 14,
                                max: 30,
                                value: parseInt(value),
                                slide: function () {
                                    if (call) call();
                                    var val = parseInt(arguments[1].value);
                                    component.setProperty("fontSize", val );
                                }
                            });
                            return html;
                        }
                    }
                );
                this.properties.push(
                    {
                        id: "align",
                        text: "横向对齐",
                        value: "left",
                        createEditor: function (component, text, value, call) {
                            var html = $("<input class='mini-combobox' value='left' style='width: 100%' name='align'>");
                            html.attr("data", JSON.stringify([
                                {id: "left", text: "左"},
                                {id: "center", text: "中"},
                                {id: "right", text: "右"}
                            ]));
                            return html;
                        }
                    }
                );
                this.properties.push(
                    {
                        id: "verticalAlign",
                        text: "纵向对齐",
                        value: "top",
                        createEditor: function (component, text, value, call) {
                            var html = $("<input class='mini-combobox' value='top' style='width: 100%' name='verticalAlign'>");
                            html.attr("data", JSON.stringify([
                                {id: "top", text: "上"},
                                {id: "center", text: "中"},
                                {id: "bottom", text: "下"}
                            ]));
                            return html;
                        }
                    }
                );
            }

            createClass(Text);

            Text.prototype.render = function () {
                var me = this;
                var container = this.getContainer(function () {
                    var m = $("<div class='mini-col-1 form-component'>");
                    var c = $("<div style='border: 0px;' class='simple-form-label edit-on-focus'>");
                    c.text("文本标签");
                    m.append(c);
                    return m;
                });

                function initVerticalAlign() {
                    var fontSize = me.getProperty("fontSize").value;
                    fontSize = fontSize || 16;
                    var height = me.getProperty("bodyHeight").value;
                    var verticalAlign = me.getProperty("verticalAlign").value;
                    if (verticalAlign === 'top') {
                        container.find(".simple-form-label")
                            .css("margin-top", "");
                    }
                    if (verticalAlign === 'center') {
                        container.find(".simple-form-label")
                            .css("margin-top", height ? height / 2 - fontSize : "");
                    }
                    if (verticalAlign === 'bottom') {
                        container.find(".simple-form-label")
                            .css("margin-top", height ? height - fontSize*1.6 : "");
                    }
                }

                this.un("propertiesChanged")
                    .on('propertiesChanged', function (key, value) {

                        if (key === 'comment') {
                            if (!value) {
                                value = "<span style='margin-right: 1em'><span class='form-hidden' style='float: left'>空白<span></span>"
                            } else {
                                value = value.replace(/\s/g, "<span style='margin-right: 1em'></span>");
                            }
                            container.find(".simple-form-label").html(value);
                        } else if (key === 'align') {
                            container.css("text-align", value);
                        } else if (key === 'verticalAlign') {
                            initVerticalAlign();
                        } else if (key === 'bodyHeight') {
                            container.css("height", value ? value + "px" : "");
                            initVerticalAlign();
                        } else if (key === 'fontSize') {
                            container.find(".simple-form-label").css("font-size", value);
                            initVerticalAlign();
                        } else {
                            container.find(".simple-form-label").attr(key, value);
                        }
                    });
                return container;
            };

            componentRepo.registerComponent("text", Text);
        }
        /**占位**/
        {
            function Hidden(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.removeProperty("placeholder");
                this.removeProperty("name");
                this.removeProperty("required");
                this.removeProperty("emptyText");
                this.getProperty("comment").value = "占位";
                this.getProperty("size").value = "12";
                this.properties.push(
                    {
                        id: "height",
                        text: "高度",
                        value: 40,
                        createEditor: function (component, text, value, call) {
                            if (!value) {
                                value = 1;
                            }
                            var html = $("<div style='margin-left: 4px;position: relative;top: 9px;width: 92%'>");
                            html.slider({
                                orientation: "horizontal",
                                range: "min",
                                min: 1,
                                max: 200,
                                value: parseInt(value) / 2,
                                slide: function () {
                                    if (call) call();
                                    var val = parseInt(arguments[1].value) * 2;

                                    component.setProperty("height", val === 2 ? "" : val);
                                    mini.parse();
                                }
                            });
                            return html;
                        }
                    }
                );
            }

            createClass(Hidden);

            Hidden.prototype.render = function () {
                var container = this.getContainer(function () {
                    var m = $("<div class='mini-col-12 form-component'>");
                    var c = $("<fieldset style='border:0px;' class=\"brick\">");
                    var label = $("<legend class='form-hidden' title='渲染时会被移除' style='font-size: 20px'>")
                        .text("占位");
                    c.append(label);
                    m.append(c);
                    return m;
                });
                this.un("propertiesChanged")
                    .on('propertiesChanged', function (key, value) {
                        if (key === 'comment') {
                            container.find("legend").text(value);
                        }
                        else if (key === 'height') {
                            container.find("fieldset").css("height", value);
                        } else {
                            container.find("legend").attr(key, value);
                        }
                    });
                return container;
            };

            componentRepo.registerComponent("hidden", Hidden);
        }

        /**文本输入框**/
        function TextBox(id) {
            Component.call(this);
            this.id = id;
            this.properties = createDefaultEditor();
            this.getProperty("comment").value = "单行文本";
        }

        {
            createClass(TextBox);

            TextBox.prototype.render = function () {
                var me = this;

                function createInput() {
                    var input = $("<input style='width: 100%;height: 100%'>");
                    input.addClass(me.cls || "mini-textbox");
                    $(me.properties).each(function () {
                        var value = this.value;
                        var property = this;
                        if (this.id) {
                            if (this.id === 'type') {
                                return;
                            }
                            if (this.id === 'height') {
                                input.css("height", value);
                            }
                            //脚本
                            if (this.script) {
                                var scriptId = "script_" + (Math.round(Math.random() * 100000000));
                                window[scriptId] = function (obj) {
                                    try {
                                        var func = eval("(function(){return function(component){" +
                                            "\n" +
                                            property.value +
                                            "\n" +
                                            "}})()");
                                        func.call(obj, me);
                                    } catch (e) {
                                        console.log("执行控件脚本失败", this, e);
                                        return;
                                    }
                                };
                                value = scriptId;
                            }
                            //数据选项
                            if (this.id === 'option') {
                                var optionConfig = value;
                                if (optionConfig.type === 'url') {
                                    input.attr("url", window.API_BASE_PATH + optionConfig.url);
                                    input.attr("textField", optionConfig.textField || 'text');
                                    input.attr("idField", optionConfig.idField || "id");
                                    input.attr("dataField", optionConfig.dataField || "text");
                                    input.attr("ajaxType", optionConfig.ajaxType || "GET");
                                    input.attr("parentField", optionConfig.parentField || "parentId");
                                    input.attr("resultAsTree", optionConfig.resultAsTree || "false");
                                } else if (optionConfig.type === 'data') {
                                    if (!window.optionalData) {
                                        window.optionalData = {};
                                    }
                                    var id = "optional_" + Math.round(Math.random() * 10000);
                                    window.optionalData[id] = optionConfig.data;
                                    value = "window.optionalData." + id;
                                    input.attr("data", value);
                                }
                            } else {
                                input.attr(this.id, value);
                            }
                        }
                        if (!this.value || this.value === 'undefined') {
                            input.removeAttr(this.id);
                        }
                    });
                    return input;
                }

                var container = this.getContainer(function () {
                    var m = $("<div>");
                    m.addClass("mini-col-" + me.getProperty("size").value)
                        .addClass("form-component");

                    var c = $("<div class=\"form-item brick\">");
                    if (me.formText) {
                        c.addClass("form-text");
                    }
                    var label = $("<label class=\"form-label\">");
                    var inputContainer = $("<div class=\"input-block\">");
                    var input = createInput();
                    label.text(me.getProperty("comment").value);
                    c.append(label).append(inputContainer.append(input));
                    m.append(c);
                    return m;
                });

                function newInput() {
                    return container.find(".input-block")
                        .html("")
                        .append(createInput());
                }

                this.un("propertiesChanged")
                    .on('propertiesChanged', function (name, value) {
                        if (name === 'comment') {
                            container.find(".form-label").text(value);
                        } else if (name === 'bodyHeight') {
                            container.find(".input-block").css("height", value);
                        }

                        else if (name === 'showComment') {
                            container.find(".input-block").addClass("component-body");
                            if (value + "" === 'true') {
                                container.find(".form-label").show();
                                container.find(".component-body").addClass("input-block");
                            } else {
                                container.find(".form-label").hide();
                                container.find(".component-body").removeClass("input-block");
                            }
                        } else {
                            newInput();
                        }
                    });
                return container;
            };

            componentRepo.registerComponent("textbox", TextBox);
        }

        /**密码**/
        {
            function Password(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.getProperty("comment").value = "密码";
                this.cls = "mini-password";
            }

            createClass(Password, TextBox);

            componentRepo.registerComponent("password", Password);
        }

        /**弹出选择**/
        {
            function ButtonEdit(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.getProperty("size").value = 4;
                this.getProperty("comment").value = "弹出选择";
                this.cls = "mini-buttonedit";
                this.properties.push(createTrueOrFalseEditor("allowInput", "可手动输入", "true"));
                this.properties.push({
                    id: "textField",
                    text: "文本字段"
                });
                this.properties.push(createScriptEditor("onbuttonclick", "点击事件", "javascript"));
            }

            createClass(ButtonEdit, TextBox);
            componentRepo.registerComponent("buttonedit", ButtonEdit);
        }

        /**文本域**/
        {
            function TextArea(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.getProperty("size").value = 12;
                this.getProperty("comment").value = "多行文本";
                this.cls = "mini-textarea";
                this.formText = true;
                this.properties.push(
                    {
                        id: "bodyHeight",
                        text: "高度",
                        value: "50",
                        createEditor: function (component, text, value, call) {
                            var html = $("<div style='margin-left: 4px;position: relative;top: 9px;width: 92%'>");
                            html.slider({
                                orientation: "horizontal",
                                range: "min",
                                min: 1,
                                max: 20,
                                value: parseInt(value) / 25,
                                slide: function () {
                                    if (call) call();
                                    component.setProperty("bodyHeight", parseInt(arguments[1].value) * 25);
                                    mini.parse();
                                }
                            });
                            return html;
                        }
                    }
                );
            }

            createClass(TextArea, TextBox);
            componentRepo.registerComponent("textarea", TextArea);
        }

        /**多选**/
        {
            function CheckBox(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.getProperty("comment").value = "多选";
                this.removeProperty("placeholder");
                this.cls = "mini-checkboxlist";
                this.properties.push(createDataSourceEditor());
            }

            createClass(CheckBox, TextBox);

            componentRepo.registerComponent("checkbox", CheckBox);
        }

        /**单选**/
        {
            function RadioBox(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.getProperty("comment").value = "单选";
                this.removeProperty("placeholder");
                this.cls = "mini-radiobuttonlist";
                this.properties.push(createDataSourceEditor());
            }

            createClass(RadioBox, TextBox);

            componentRepo.registerComponent("radio", RadioBox);
        }

        /**下拉列表**/
        {
            function Combobox(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.cls = "mini-combobox";
                this.getProperty("comment").value = "下拉列表";
                this.properties.push(createDataSourceEditor());
                this.properties.push(createTrueOrFalseEditor("allowInput", "可手动输入", "true"));
                this.properties.push(createTrueOrFalseEditor("multiSelect", "多选", "false"));
                // this.properties.push({
                //     id: "data",
                //     text: "选项",
                //     value: JSON.stringify([{id: "1", text: '选项1'}, {id: "2", text: '选项2'}])
                // });
            }

            createClass(Combobox, TextBox);


            componentRepo.registerComponent("combobox", Combobox);
        }

        /**树列表**/
        {
            function TreeSelect(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.cls = "mini-treeselect";
                this.getProperty("comment").value = "树列表";
                this.properties.push(createDataSourceEditor());
                this.properties.push(createTrueOrFalseEditor("allowInput", "可手动输入", "true"));
                this.properties.push(createTrueOrFalseEditor("multiSelect", "多选", "false"));
            }

            createClass(TreeSelect, TextBox);


            componentRepo.registerComponent("treeselect", TreeSelect);
        }

        /**日期选择**/
        {
            function Datepicker(id) {
                Component.call(this);
                this.id = id;
                this.properties = createDefaultEditor();
                this.cls = "mini-datepicker";
                this.properties.push({
                    id: "format",
                    editor: "textbox",
                    text: "日期格式",
                    value: "yyyy-MM-dd"
                });
                this.getProperty("comment").value = "日期选择";
            }

            createClass(Datepicker, TextBox);

            componentRepo.registerComponent("datepicker", Datepicker);
        }
    }

    /**子表单**/
    {
        function Form(id) {
            Component.call(this);
            this.id = id;
            this.properties = createDefaultEditor();
            this.removeProperty("placeholder");
            this.removeProperty("name");
            this.removeProperty("required");
            this.removeProperty("emptyText");
            this.getProperty("comment").value = "子表单";
            this.getProperty("size").value = "12";
            this.properties.push(
                {
                    id: "bodyHeight",
                    text: "高度",
                    value: "150",
                    createEditor: function (component, text, value, call) {
                        var html = $("<div style='margin-left: 4px;position: relative;top: 9px;width: 92%'>");
                        html.slider({
                            orientation: "horizontal",
                            range: "min",
                            min: 1,
                            max: 20,
                            value: parseInt(value) / 25,
                            slide: function () {
                                if (call) call();
                                var height = parseInt(arguments[1].value) * 25;
                                if (height === 25) {
                                    component.setProperty("bodyHeight", "");
                                } else {
                                    component.setProperty("bodyHeight", height);
                                }
                                mini.parse();
                            }
                        });
                        return html;
                    }
                }
            );
            this.properties.push(createTrueOrFalseEditor("hidden", "隐藏标题", "false"));
        }

        createClass(Form, Component, "高级控件");

        Form.prototype.render = function () {
            var me = this;
            var container = this.getContainer(function () {
                var m = $("<div class='mini-col-12 form-component'>");
                var c = $("<fieldset class=\"brick child-form\">");
                var label = $("<legend title='渲染时会被移除' style='font-size: 20px'>");
                var text = $("<span>").text("子表单");
                c.append(label.append(text));
                c.append("<div style='position: relative;' class='components'>");
                c.css("height", me.getProperty("bodyHeight").value + "px")
                m.append(c);
                return m;
            });
            this.un("propertiesChanged")
                .on('propertiesChanged', function (key, value) {
                    if (key === 'comment') {
                        container.find("legend").text(value);
                    }
                    else if (key === 'bodyHeight') {
                        container.find("fieldset:first").css("height", value);
                    } else if (key === 'hidden') {
                        if (value === 'false') {
                            container.find("legend:first").removeClass("form-hidden");
                        } else {
                            container.find("legend:first").addClass("form-hidden");
                        }
                    } else {
                        container.find("legend:first").attr(key, value);
                    }
                });
            return container;
        };

        componentRepo.registerComponent("form", Form);
    }
    /**自适应表格**/
    {
        function Table(id) {
            Component.call(this);
            this.id = id;
            this.properties = createDefaultEditor();
            this.removeProperty("placeholder");
            this.removeProperty("name");
            this.removeProperty("required");
            this.removeProperty("placeholder");
            this.removeProperty("height");
            this.getProperty("comment").value = "表格表单";
            this.getProperty("size").value = "12";
            this.properties.push(
                {
                    id: "bodyHeight",
                    text: "高度",
                    value: "150",
                    createEditor: function (component, text, value, call) {
                        if (!value) {
                            value = 1;
                        }
                        var html = $("<div style='margin-left: 4px;position: relative;top: 9px;width: 92%'>");
                        html.slider({
                            orientation: "horizontal",
                            range: "min",
                            min: 1,
                            max: 20,
                            value: parseInt(value) / 25,
                            slide: function () {
                                if (call) call();
                                var height = parseInt(arguments[1].value) * 25;
                                if (height === 25) {
                                    component.setProperty("bodyHeight", "");
                                } else {
                                    component.setProperty("bodyHeight", height);
                                }
                                mini.parse();
                            }
                        });
                        return html;
                    }
                }
            );
        }

        createClass(Table, Component, "高级控件");

        Table.prototype.render = function () {
            var me = this;
            var container = this.getContainer(function () {
                var m = $("<div class='mini-col-12 form-component'>");
                var c = $("<fieldset style='border: 0;' class=\"brick child-form\">");
                var label = $("<legend align='center' title='表格表单' style='font-size: 20px'>");
                var text = $("<span>").text("表格表单");
                c.append(label.append(text));
                c.append($("<div class='components table'>")
                    .css("height", me.getProperty("bodyHeight").value + "px"));
                m.append(c);
                return m;
            });
            this.un("propertiesChanged")
                .on('propertiesChanged', function (key, value) {
                    if (key === 'comment') {
                        container.find("legend:first").text(value);
                    } else if (key === 'showComment') {
                        if (value + "" === 'false') {
                            container.find("legend:first").addClass('form-hidden');
                        } else {
                            container.find("legend:first").removeClass('form-hidden');
                        }

                    }
                    else if (key === 'bodyHeight') {
                        container.find(".table:first").css("height", value);
                    } else {
                        container.find("legend:first").attr(key, value);
                    }
                });
            return container;
        };

        componentRepo.registerComponent("table", Table);
    }
})();