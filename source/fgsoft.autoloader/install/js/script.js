(function($) {

    // DEFAULT_VARS //

/////////////////////////////////////////
    // public methods
    var methods = {
        // plugin initialization
        init: function (params) {

            // /*current settings
            var options = $.extend({}, defaults, params); //replace the default data transmitted in the plugin
            //identify the main div within which work
            options.wrap = '#'+ $(this).attr("id");
            if(options.wrapNavigation == ''){
                options.wrapNavigation = options.wrap;
            }

            //determine the sequence number of the component
            options.numPagen = $(options.wrapNavigation + ' .text:eq(1)').find('b').next().attr('href').match(/PAGEN_(\d+)/i)[1];
            options.pagen = new RegExp('PAGEN_'+options.numPagen+'=(\\d+)','i');

            //determine the current page and the total number of pages
            options.currentPage = parseInt($(options.wrapNavigation+' font:last').find('b').text());
            options.numberOfPages = $(options.wrapNavigation+' .text:eq(1) > a:last').attr('href').match(options.pagen)[1];

            //determine ajaxid
            //options.bxajaxid = $('> div', this).prop('id').replace('comp_', '');
            if($(this).parents("[id^='comp_']").length) {
                options.bxajaxid = $(this).parents("[id^='comp_']").prop('id').replace('comp_', '');
            }
            // current settings */

            //determine the number of elements
            var r1 = options.textElementsFrom+' (\\d+)';
            var r2 = '(\\d+) '+options.textElementsFrom;

            options.numberOfElements = $(options.wrapNavigation+' font:first-of-type').html().match(RegExp(r1,'i'))[1];
            options.showElements = $(options.wrapNavigation+' font:first-of-type').html().match(RegExp(r2,'i'))[1];
            options.elementsPerPage = options.showElements/options.currentPage;

            //hide page navigation
            $(options.wrapNavigation + ' font').hide();

            //add a link at the end at which the pressing elements will be uploading
            if($(options.wrapNavigation + ' .' + options.buttonClass).length == 0) {
                $(options.wrapNavigation).append('<div class="' + options.divButtonClass + '">' + options.buttonIcon + '<a class="' + options.buttonClass + ' ' + options.buttonExtraClass + '" href="#"></a><img src="' + options.buttonLoader + '" style="display: none;"></div>');
            }
            if(options.checkAutoload == 'Y'){
                if($(options.wrapNavigation + ' #autoload-checkbox').length == 0) {
                    $(options.wrapNavigation).append('<div id="autoload-checkbox" class="' + options.divButtonClass + '"><label><input type="checkbox" name="check-auto-loading" id="check-auto-loading" checked></label>' + options.autoloadText + '</div>');
                }
            }
            //$(options.wrap).append('<br/><br/>');

            //define the button text, depending on the selected settings
            if(options.checkTemplate == 'Y') {
                $(options.wrapNavigation + ' .' + options.buttonClass).text(options.showElementsText + ' '+ options.showElements + ' ' +options.showElementsFrom + ' '+ options.numberOfElements + '. '+ options.downloadElementsText +' ' + options.elementsPerPage + ' '+ options.downloadElementsTo +'.');
            }
            else{
                $(options.wrapNavigation + ' .' + options.buttonClass).text(options.buttonName);
            }

            //track the click of a button
            $(options.wrapNavigation+' .'+options.buttonClass).click(function (e) {

                //disable the link at the time of the script
                if ($(options.wrapNavigation+' .'+options.buttonClass).hasClass('busy')) {
                    return;
                }
                $(options.wrapNavigation+' .'+options.buttonClass).addClass('busy');

                $(options.wrapNavigation+' .'+options.divButtonClass).find('img').show();
                $(options.wrapNavigation+' .'+options.divButtonClass).find('i').hide();
                $(options.wrapNavigation+' .'+options.divButtonClass).find('a').hide();

                //forming data
                var data = {};
                data['PAGEN_' + options.numPagen] = options.currentPage + 1;

                if (options.checkAjaxMode == 'Y') {
                    data['bxajaxid'] = options.bxajaxid;
                    data['ajaxload'] =  'Y';
                }

                var loc_params = '';
                $.each(data, function(index, value){
                    //console.log("INDEX: " + index + " VALUE: " + value);
                    if(loc_params == ''){
                        loc_params = index + '=' + value;
                    }
                    else {
                        loc_params = loc_params + '&' + index + '=' + value;
                    }
                });

                var loc;
                if(location.href.indexOf('?') != -1){
                    loc = location.href + '&' + loc_params;
                }
                else {
                    loc = location.href + '?' + loc_params;
                }

                //handling hash and moving it to the end of the line
                if(loc.indexOf(location.hash) != -1){
                    loc = loc.replace(location.hash,'');
                    loc = loc + location.hash;
                }


                //BX.ajax.insertToNode;
                url = loc;
                node = 'comp_' + options.bxajaxid;
                node = BX(node);

                if (!!node)
                {
                    var eventArgs = { cancel: false };
                    BX.onCustomEvent('onAjaxInsertToNode', [{ url: url, node: node, eventArgs: eventArgs }]);

                    if(eventArgs.cancel === true)
                    {
                        return;
                    }
                    // var show = null;
                    // if (tempDefaultConfig && !tempDefaultConfig.denyShowWait)
                    // {
                    //     show = BX.showWait(node);
                    //     delete tempDefaultConfig.denyShowWait;
                    // }

                    BX.ajax.get(url, function(data) {
                        if (options.autoAppend) {
                            if($(data).find('#script_autoloader').length) {
                                $(data).find('#script_autoloader').remove();
                            }
                            $(data).find(options.item).each(function () {
                                $(options.wrap).find(options.item).last().after($(this));
                            });
                        }

                        $(options.wrap).trigger({
                            type: 'autoloaderComplete',
                            items: $(data).find(options.wrap).find(options.item)
                        });

                        //remove class busy
                        $(options.wrapNavigation+' .'+options.buttonClass).removeClass('busy');

                        //hide pagination in the newly loaded page
                        $(options.wrapNavigation + ' font').hide();

                        //check whether reached the last page, if so, remove the link
                        if (options.currentPage+1 >= options.numberOfPages) {
                            $(options.wrapNavigation+' .'+options.divButtonClass).find('img').hide();
                            $(options.wrapNavigation+' .'+options.divButtonClass).find('i').hide();
                            $(options.wrapNavigation+' .'+options.divButtonClass).find('a').hide();
                            $(options.wrapNavigation+' .'+options.divButtonClass).hide();

                            if(options.checkAutoload == 'Y'){
                                $(options.wrapNavigation+' #autoload-checkbox').hide();
                            }

                            $(options.wrapNavigation+' .'+options.buttonClass).addClass('busy');
                        }
                        else {
                            $(options.wrapNavigation+' .'+options.divButtonClass).find('img').hide();
                            $(options.wrapNavigation+' .'+options.divButtonClass).find('i').show();
                            $(options.wrapNavigation+' .'+options.divButtonClass).find('a').show();
                        }

                        //increasing the page number 1
                        options.currentPage = options.currentPage + 1;
                        //increase the number of items shown
                        options.showElements = parseInt(options.showElements) + parseInt(options.elementsPerPage);

                        //calculate number of elements to download
                        if( (parseInt(options.numberOfElements)-parseInt(options.showElements)) < parseInt(options.elementsPerPage)){
                            options.elementsPerPage = parseInt(options.numberOfElements) - parseInt(options.showElements);
                        }

                        //show an updated text of the button, depending on the template
                        if(options.checkTemplate == 'Y') {
                            $(options.wrapNavigation + ' .' + options.buttonClass).text(options.showElementsText + ' '+ options.showElements + ' ' +options.showElementsFrom + ' '+ options.numberOfElements + '. '+ options.downloadElementsText +' ' + options.elementsPerPage + ' '+ options.downloadElementsTo +'.');
                        }
                        else{
                            $(options.wrapNavigation + ' .' + options.buttonClass).text(options.buttonName);
                        }
                    });
                }

                e.preventDefault();
            });

            //monitoring scroll to implementation of auto-scroll
            $(window).on('scroll', function () {
                if($(options.wrapNavigation + ' #check-auto-loading').length && $(options.wrapNavigation + ' #check-auto-loading').is(':checked')) {
                    if(options.checkCoordsConsoleLog == "Y") {
                        console.log(($(window).scrollTop() + options.autoloadSize) + ' > ' + $('.' + options.divButtonClass).offset().top + ' OR ' + $(document).outerHeight() + ' = ' + ($(window).scrollTop() + $(window).height()));
                    }

                    if (($(window).scrollTop() + options.autoloadSize) > $('.' + options.divButtonClass).offset().top || ($(window).scrollTop() + $(window).height()) == $(document).outerHeight()) {
                        $(options.wrapNavigation + ' .' + options.buttonClass).trigger('click');
                    }
                }
            });

        }
    };
/////////////////////////////////////////

    $.fn.showMorePlugin = function(method){

        if ( methods[method] ) {
            // If the requested method exists, we call it
            // All parameters, except for the name of the method will come in the method
            // This will move in the same method
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            // If the first parameter is an object, or completely empty
            // Execute the init method
            return methods.init.apply( this, arguments );
        } else {
            // If nothing happened
            $.error( 'Method "' +  method + '" unable to find in the plugin jQuery.showMorePlugin' );
        }
    };

/////////////////////////////////////////


})(jQuery);
