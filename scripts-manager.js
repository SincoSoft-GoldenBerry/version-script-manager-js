/**
 * @license scripts-manager.js v0.0.1
 * (c) 2019-2020 Sincosoft, Inc. http://sinco.com.co
 * 
 * Creation date: 29/11/2019
 * Last change: 02/12/2019
 *
 * by GoldenBerry
 *
 * Needed references:
 *      - s5.js
**/

(function(w){
    var _urlBase = document.currentScript.src.split('/');
    _urlBase.pop();
    _urlBase = _urlBase.join('/');

    var loadSources = function (version, config) {
        var urlPath = window.location.pathname.split('/').clean('');
        urlPath.shift();

        var prop;
        var pathModule = [];
        do {
            prop = urlPath.shift().toLowerCase();
            pathModule.push(prop);
            config = config[prop];
        }
        while(urlPath.length > 0);

        //Si aún no ha llegado a la configuración de la página
        if (!Array.isArray(config)) {
            var url = null;
            var verificarUrl = function () {
                if (pathModule.findIndex(function(path) { return path === url; }) < 0)
                    pathModule.push(url); 
            };

            if (document.querySelector('input[type=password]')) {
                url = 'login.aspx';
                verificarUrl();
            }
            else if (document.querySelector('select')) {
                url = 'seleccion.aspx';
                verificarUrl();
            }
            else if (document.querySelector('input[type=text]')) {
                url = 'default.aspx';
                verificarUrl();
            }
            config = config[url];
        }

        if (Array.isArray(config)) {
            var configuracionPagina = config.find(function(obj){
                return new RegExp(version, 'gi').test(obj.version);
            });

            if (configuracionPagina) {
                //ACÁ VOY, TOCA MIRAR LAS RUTAS!!!
                pathModule.unshift(_urlBase);
                pathModule.push(version.replace(/\:/g, '_'));
                pathModule = pathModule.map(function(p){ 
                    if (p.indexOf('://') >= 0) return p;
                    return p.replace(/\./g, '_'); 
                });
                
                w['sinco-app'] = Sinco.initialize(null, null, pathModule.join('/'));
                w['sinco-app'].require(configuracionPagina.modules, function () {
                    var modulos = [].slice.call(arguments);
                    modulos.forEach(function(modulo){
                        if (modulo && modulo.start) {
                            modulo.start();
                        }
                    });
                });
            }
        }
    };

    var loadConfig = function(version) {
        Sinco.Request('GET', _urlBase + '/config.json',{
            Ok: function (config) {
                loadSources(version, config);
            }
        });
    };

    Sinco.Request('GET', 'version.json',{
        Ok: function (version) {
            loadConfig(version[0].fecha);
        }
    });

})(window);