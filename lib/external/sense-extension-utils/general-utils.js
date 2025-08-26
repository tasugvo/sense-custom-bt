/*!
 * sense-export - Just a simple button to export data in your Qlik Sense application without displaying them in a table first.
 * --
 * @version v1.3.5
 * @link https://github.com/stefanwalther/sense-export
 * @author Stefan Walther
 * @license MIT
 */

/*!
 * sense-extension-utils - Sugar methods on top of Qlik Sense' Capability APIs to be used in visualization extensions and mashups.
 * --
 * @version v0.4.1
 * @link https://github.com/stefanwalther/sense-extension-utils
 * @author Stefan Walther (https://github.com/stefanwalther)
 * @license MIT
 */

define([
    "qlik",
    "jquery",
    "underscore"
], function (qlik, $, _) {
    "use strict";
    
    // Função para adicionar link de CSS ao cabeçalho
    function addStyleLinkToHeader(linkUrl, id) {
        if (id && !_.isEmpty(id) && !$("#" + id).length) {
            var $styleLink = $(document.createElement("link"));
            $styleLink.attr("rel", "stylesheet");
            $styleLink.attr("type", "text/css");
            $styleLink.attr("href", linkUrl);
            
            if (id && !_.isEmpty(id)) {
                $styleLink.attr("id", id);
            }
            
            $("head").append($styleLink);
        }
    }
    
    // Função para adicionar CSS inline ao cabeçalho
    function addStyleToHeader(cssContent, id) {
        if (id && typeof id === "string") {
            if (!$("#" + id).length) {
                $("<style>").attr("id", id).html(cssContent).appendTo("head");
            }
        } else {
            $("<style>").html(cssContent).appendTo("head");
        }
    }
    
    // Função para obter o caminho base da aplicação
    function getBasePath() {
        var prefix = window.location.pathname.substr(0, window.location.pathname.toLowerCase().lastIndexOf("/sense") + 1);
        var url = window.location.href;
        url = url.split("/");
        return url[0] + "//" + url[2] + (prefix[prefix.length - 1] === "/" ? prefix.substr(0, prefix.length - 1) : prefix);
    }
    
    // Função para obter informações da extensão
    function getExtensionInfo(extensionUniqueName) {
        var defer = $q.defer();
        var url = getBasePath() + "/extensions/" + extensionUniqueName + "/" + extensionUniqueName + ".qext";
        
        $http.get(url).then(function (response) {
            defer.resolve(response.data);
        }).catch(function (err) {
            defer.reject(err);
        });
        
        return defer.promise;
    }
    
    // Função para obter o caminho da extensão
    function getExtensionPath(extensionUniqueName) {
        return window.location.pathname.substr(0, window.location.pathname.toLowerCase().lastIndexOf("/sense") + 1) + "extensions/" + extensionUniqueName;
    }
    
    // Função para obter a versão do produto
    function getProductVersion() {
        var defer = $q.defer();
        var global = qlik.getGlobal({});
        
        global.getProductVersion(function (reply) {
            var v = reply.qReturn;
            var lastDot = xIndexOf(v, ".", 2);
            var rest = v.substr(lastDot + 1);
            var chars = rest.split("");
            var numDigitsAfterRest = 0;
            
            for (var i = 0; i < chars.length; i++) {
                if (!_.isNumber(chars[i])) {
                    numDigitsAfterRest = i + 1;
                    break;
                }
            }
            
            defer.resolve(v.substr(0, lastDot + 1 + numDigitsAfterRest));
        });
        
        return defer.promise;
    }
    
    // Injeção de dependências do Angular
    var $injector = angular.injector(["ng"]);
    var $q = $injector.get("$q");
    var $http = $injector.get("$http");
    
    // Polyfill para String.prototype.startsWith (para navegadores mais antigos)
    if (typeof String.prototype.startsWith !== "function") {
        String.prototype.startsWith = function (str) {
            if (str == null) return false;
            
            var i = str.length;
            if (this.length < i) return false;
            
            for (--i; i >= 0 && this[i] === str[i]; --i);
            return i < 0;
        };
    }
    
    // Retorna as funções públicas
    return {
        addStyleToHeader: addStyleToHeader,
        addStyleLinkToHeader: addStyleLinkToHeader,
        getExtensionInfo: getExtensionInfo,
        getExtensionPath: getExtensionPath,
        getProductVersion: getProductVersion,
        getBasePath: getBasePath
    };
});