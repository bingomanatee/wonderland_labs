angular.module('wizards', ['wizardsServices']).filter('round',
    function () {
        return function (n) {
            var v = Math.round(10 * n);
            return v / 10;
        }
    })

angular.module('wizardsServices', ['ngResource']).
    factory('Wizards',function ($resource) {
        return $resource('/admin/wizard/rest/:_id', {_id:"@_id"}, {
            get:{method:'GET'},
            query:{method:'GET', isArray:true},
            add:{method:'POST' },
            update:{method:'PUT' },
            delete:{method:'DELETE'}
        });
    }).factory('WizardSteps', function ($resource) {
        return $resource('/admin/wizard/step_rest/:_id', {_id:"@_id"}, {
            get:{method:'GET'},
            query:{method:'GET', isArray:true},
            add:{method:'POST' },
            update:{method:'PUT' },
            delete:{method:'DELETE'}
        });
    });

function WizardsCtrl($scope, $filter, $compile, Wizards, WizardSteps) {

    /* *************** MODEL ************************** */
    
    $scope.wizards = Wizards.query();
    $scope.steps = WizardSteps.query();
    $scope.coms = coms;
    $scope.colspan = 7;

    $scope.steps_filter = function (item, id) {
        return item.wizard == id;
    }

    $scope.wizard_steps = function (wizard) {
        return _.filter($scope.steps, function (s) {
            return s.wizard == wizard._id
        });
    }

    /* ***************** CLOSE DLOG ******************** */

    $scope.close_dlog = function (id) {
        var show = 'show_' + id;
        console.log('closing ' + show);
        $scope[show] = false;
        $scope.remove_editor(id + '_content');
    }

    /* ***************** SEQ ORDER ************************* */

    // flattens order values into a prefect sequence from 1 .. n

    $scope.seq_order = function (wizard) {
        var steps = $scope.wizard_steps(wizard);
        _.each(_.sortBy(steps, function (s) {
            return parseInt(s.order)
        }),

            function (step, i) {
                step.order = i + 1;
                WizardSteps.update(step);
            })
    }

    /* ****************** PREVIEW *************************** */

    $scope.publish_wizard_show = false;
    $scope.view_wizard = {};
    $scope.preview_url = '';
    $scope.preview = function (wizard) {
        if (!wizard.name) return window.alert('you must give your wizard a name!');
        $scope.view_wizard = wizard;
        $scope.preview_url = '/wizard/' + wizard.name;
        $scope.publish_wizard_show = true;
    }

    $scope.export = function(){
        console.log('exporting wizard');
    }

    /* ******************* HTML EDITOR ************************ */

    $scope.html_editor = function (id, target) {

        var txt_field = $('#' + id);

        var show = $scope[id + '_html_checked'];

        if (show) {
          var  html_field = $("#" + id + '_html');
        html_field.val(target.content);
            var editor = CKEDITOR.replace(id + '_html', {
                toolbar : 'Limited',

                toolbar_Limited :
                [
                	{ name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
                	{ name: 'editing', items : [ 'Find','Replace','-','SelectAll','-','SpellChecker', 'Scayt' ] },
                	{ name: 'forms', items : [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'HiddenField' ] },

                	{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','Subscript','Superscript','-','RemoveFormat' ] },
                	{ name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','CreateDiv',
                	'-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-' ] },
                	{ name: 'links', items : [ 'Link','Unlink','Anchor' ] },
                	{ name: 'insert', items : [ 'Image','Table','HorizontalRule','Smiley','SpecialChar'] },

                	{ name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
                	{ name: 'colors', items : [ 'TextColor','BGColor' ] },
                	{ name: 'tools', items : [ 'Source','-', 'Maximize', 'ShowBlocks','-','About' ] }
                ]

            });
            target.content_type = 'html';
            txt_field.hide();

            function _save_editor(e) {
                var data = editor.getData();

                txt_field.val(data);
                target.content = data;
                try {
                    $scope.$apply();
                } catch (e) {
                    console.log('...');
                }
            }

            editor.on('change', _save_editor); // note - plugin enabled event
            editor.on('blur', _save_editor)

            txt_field.data('editor', editor);
            txt_field.data('editor', editor);
            txt_field.data('html_field', html_field);
        } else {
            $scope.remove_editor(id);
        }

    }

    $scope.remove_editor = function (id) {
        console.log('remving editor from ', id);
        var txt_field = $('#' + id);

        var editor = txt_field.data('editor');

        if (editor) {
            var html_field = txt_field.data('html_field');
            txt_field.show();
            txt_field.removeData('editor');
            editor.destroy();
            html_field.hide();
            if ($scope[id + '_html_checked']) {
                $scope[id + '_html_checked'] = false;
                // might recurse but lack of editor should limit recrusion to 1 cycle
            }
            // note - NOT resetting content type; removing the editor is not necessarily an indicator
        }

    }

    /* ******************* PUBLISH *********************** */

    $scope.publish_wizard_show = false;
    $scope.publish = function(wizard){
        console.log('publishing ', wizard);
        $scope.publish_wizard = wizard;
        var template = $('#publish_wizard_template').html();
        console.log('tempate: ', template);
        var _publish_form = $compile(template);

        $('#publish_wizard').html(_publish_form($scope));
        $('#publish_form').submit(function(){
            alert('your wizard has been published. Restart your app to test it.');
            return false;
        });
        $scope.publish_wizard_show = true;
    }

    $scope.get_com = function(com){
        console.log('getting com', com, 'from', $scope.coms);
        if (com){
            return _.find($scope.coms, function(c){return c.name == com});
        } else {
            return null
        }
    }

    $scope.export_component = '';
    $scope.export_wizard = function(){
        $scope.publish_wizard_show = false;
        if ($scope.export_component && $scope.publish_wizard){

            var data = {
                com: $scope.get_com($scope.export_component),
                wizard: $scope.publish_wizard._id
            }
            $.post('/admin/wizards/' + $scope.publish_wizard.name, data, function(res){
                console.log('published wizard: response ', res);
            })
        }
    }

    /* ****************** NEW WIZARD ********************* */

    $scope.show_new_wizard = false;
    $scope.init_new_wizard = function () {
        $scope.new_wizard = {title:'new wizard', notes:'', def_path:'path/to/wizard.json'};
    }
    $scope.init_new_wizard();

    $scope.add_wizard = function () {
        $scope.init_new_wizard();
        $scope.show_new_wizard = true;
    }

    $scope.create_wizard = function (new_wizard) {
        $scope.wizards.push(Wizards.add(new_wizard));
        $scope.init_new_wizard();
        $scope.close_dlog('new_wizard');
    }

    /* ******************** EDIT WIZARD *********************** */


    $scope.show_edit_wizard = false;
    $scope.edit_wizard = {};

    $scope.update_wizard = function (edit_wizard) {
        Wizards.update(edit_wizard);
        $scope.show_edit_wizard = false;
        $scope.edit_wizard = {};
    }

    $scope.edit_wizard = function (wizard) {
        $scope.edit_wizard = wizard;
        $scope.show_edit_wizard = true;
    }

    /* ********************* DELETE WIZARD ******************* */

    $scope.delete_wizard = function (wizard) {
        Wizards.delete(wizard);
        $scope.wizards = Wizards.query()
    }

    /* ******************* CREATE STEP ********************** */

    $scope.show_new_step = false;
    $scope.new_step_wizard = {}; // the parent wizard for a given step

    $scope.init_new_step = function () {
        $scope.new_step = {title:'new step', notes:'new step notes', content_type:'text'};
    }
    $scope.init_new_step();

    $scope.add_step = function (wizard) {
        $scope.init_new_step();
        $scope.new_step_wizard = wizard;
        var _new_form = $compile($('#new_step_template').html());

        $('#show_new_step').html(_new_form($scope));
       $('#new_step_form').submit(function(){
           return false;
       })
        $scope.show_new_step = true;
    }

    $scope.create_step = function (step) {

        step.wizard = $scope.new_step_wizard._id;
        var steps = $scope.wizard_steps($scope.new_step_wizard);
        var max_step = _.reduce(steps, function (ms, step) {
            return Math.max(parseInt(step.order), ms);
        }, 0)
        step.order = max_step + 1;
        $scope.steps.push(WizardSteps.add(step));
        $scope.close_dlog('new_step');
    }

    /* ***************** EDIT STEP ****************************** */

    $scope.edit_step = {};
    $scope.edit_step_wizard = {};
    $scope.show_edit_step = false;


    $scope.change_step = function (step, wizard) {
        $scope.edit_step_wizard = wizard;
        $scope.edit_step = step;
        var _edit_form = $compile($('#edit_step_template').html());

        $('#show_edit_step').html(_edit_form($scope)
        );   $('#edit_step_form').submit(function(){
            return false;
        })
        $scope.show_edit_step = true;
    }

    $scope.update_step = function (step) {
        step.order = parseInt(step.order);
        WizardSteps.update(step);
        $scope.close_dlog('edit_step');
    }

    /* ******************** DELETE STEP ************************ */

    $scope.delete_step = function (step) {
        WizardSteps.delete(step);
        $scope.steps = WizardSteps.query()
    }


}

WizardsCtrl.$inject = ['$scope', '$filter', '$compile', 'Wizards', 'WizardSteps'];


