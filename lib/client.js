define([], function() {

    var init = function(panel, socket) {
        socket.on('profiles', function(profiles) {
            var html = '';

            for( var key in profiles ) {
                var profile = profiles[key];

                var statusClass = 'fa-circle-o red';
                var statusPulseClass = 'hide';


                if( profile.is_streaming ) {
                    if( profile.is_playlist ) {
                        statusClass = 'fa-circle yellow';
                    }
                    else {
                        statusClass = 'fa-circle green';
                        statusPulseClass = 'pulse';
                    }
                }
                html += '<div class="text-center channel ma6"><img class="mb3" src="' + profile.logo + '" /><div>' + profile.display_name + '<span class="fa-stack"><i class="fa fa-fw fa-stack-1x fa-circle-o ' + statusPulseClass + '"></i><i class="fa fa-fw fa-stack-1x ' + statusClass + '"></i></span></div></div>';
            }

            panel.innerHTML = html;
        });
    };

    return init;
});
