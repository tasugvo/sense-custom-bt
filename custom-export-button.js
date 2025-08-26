/*!
 * sense-export - Just a simple button to export data in your Qlik Sense application without displaying them in a table first.
 * --
 * @version v1.3.5
 * @link https://github.com/stefanwalther/sense-export
 * @author Stefan Walther
 * @license MIT
 */

/* global define, saveAs */
define([
    "angular",
    "qlik",
    "./properties",
    "./initialproperties",
    "text!./lib/css/main.min.css",
    "text!./template.ng.html",
    "./lib/external/sense-extension-utils/general-utils",
    "./lib/external/file-saver/FileSaver.min",
    "./lib/components/eui-button/eui-button",
    "./lib/components/eui-overlay/eui-overlay",
    "./lib/components/eui-simple-table/eui-simple-table"
], function (angular, qlik, props, initProps, cssContent, ngTemplate, generalUtils) {
    "use strict";
    
    // Injeção de dependências Angular
    var $injector = angular.injector(["ng"]);
    var $q = $injector.get("$q");
    
    // Adiciona estilos CSS ao cabeçalho
    generalUtils.addStyleToHeader(cssContent);
    
    // Adiciona FontAwesome CSS
    var faUrl = "/extensions/custom-export-button/lib/external/fontawesome/css/font-awesome.min.css";
    generalUtils.addStyleLinkToHeader(faUrl, "custom_export_button__fontawesome");
    
    return {
        definition: props,
        initialProperties: initProps,
        snapshot: {
            canTakeSnapshot: false
        },
        template: ngTemplate,
        controller: ["$scope", function ($scope) {
            
            // ========================================
            // CONFIGURAÇÕES INICIAIS
            // ========================================
            
            // Configurações de debug
            $scope.DEBUG = $scope.layout.props.isDebugOutput || true;
            $scope.exporting = false;
            
            // Constantes de performance
            var PAGE_SIZE = 5000;
            var DEFAULT_WIDTH = 20;
            var HYPERCUBE_UPDATE_DELAY = 100;
            
            // ========================================
            // WATCHERS E OBSERVADORES
            // ========================================
            
            // Observa mudanças nas propriedades
            $scope.$watchCollection("layout.props", function (newVals, oldVals) {
                if (newVals && oldVals) {
                    Object.keys(newVals).forEach(function (key) {
                        if (newVals[key] !== oldVals[key]) {
                            $scope[key] = newVals[key];
                        }
                    });
                }
            });
            
            // ========================================
            // FUNÇÕES DE UTILIDADE
            // ========================================
            
            // Verifica se a versão do Qlik Sense é suportada
            $scope.showUnsupportedOverlay = function () {
                return typeof qlik.table === "undefined";
            };
            
            // Função de debug
            $scope.debug = function () {
                return $scope.layout.props.isDebug === true && 
                       qlik.navigation && 
                       qlik.navigation.getMode() === "edit";
            };
            
            // Função de log para debug
            $scope.log = function (msg, arg) {
                if ($scope.DEBUG) {
                    console.log("[Custom Export Button]", msg, arg);
                }
            };
            
            // Obtém o caminho base da aplicação
            $scope.getBasePath = function () {
                var prefix = window.location.pathname.substr(0, window.location.pathname.toLowerCase().lastIndexOf("/sense") + 1);
                var url = window.location.href;
                url = url.split("/");
                return url[0] + "//" + url[2] + (prefix[prefix.length - 1] === "/" ? prefix.substr(0, prefix.length - 1) : prefix);
            };
            
            // ========================================
            // PROCESSAMENTO DO HIPERCUBO
            // ========================================
            
            // Processa e define o hipercubo com os dados quando o botão é clicado
            $scope.processHyperCube = function () {
                var deferred = $q.defer();
                
                try {
                    // Obtém as dimensões e medidas configuradas pelo usuário
                    var dimensions = $scope.layout.qDimensions || [];
                    var measures = $scope.layout.qMeasures || [];
                    
                    // Verifica se há dimensões e medidas configuradas
                    if (dimensions.length === 0 && measures.length === 0) {
                        $scope.log("Nenhuma dimensão ou medida configurada, continuando...");
                        deferred.resolve();
                        return deferred.promise;
                    }
                    
                    // Define o hipercubo com os dados reais
                    var hyperCubeDef = {
                        qDimensions: dimensions,
                        qMeasures: measures,
                        qInitialDataFetch: [{
                            qWidth: dimensions.length + measures.length,
                            qHeight: PAGE_SIZE
                        }]
                    };
                    
                    $scope.log("Configurando hipercubo com", dimensions.length + measures.length, "colunas");
                    
                    // Aplica a definição do hipercubo usando setProperties
                    $scope.ext.model.setProperties({
                        qHyperCubeDef: hyperCubeDef
                    }).then(function() {
                        // Aguarda um momento para o hipercubo ser atualizado
                        setTimeout(function() {
                            $scope.log("Hipercubo configurado com sucesso");
                            deferred.resolve();
                        }, HYPERCUBE_UPDATE_DELAY);
                    }).catch(function(err) {
                        $scope.log("Erro ao definir hipercubo:", err);
                        deferred.reject(err);
                    });
                    
                } catch (error) {
                    $scope.log("Erro inesperado ao processar hipercubo:", error);
                    deferred.reject(error);
                }
                
                return deferred.promise;
            };
            
            // ========================================
            // EXPORTAÇÃO DE DADOS
            // ========================================
            
            // Função principal de exportação
            $scope.export = function () {
                if ($scope.exporting) {
                    $scope.log("Exportação já em andamento, ignorando clique");
                    return;
                }
                
                $scope.exporting = true;
                $scope.log("Iniciando exportação...");
                
                // Primeiro, processa e define o hipercubo com os dados
                $scope.processHyperCube().then(function() {
                    $scope.log("Hipercubo processado, iniciando exportação...");
                    
                    switch ($scope.layout.props.exportFormat) {
                        case "OOXML":
                        case "CSV_C":
                        case "CSV_T":
                            $scope.exportServerSide();
                            break;
                            
                        case "CSV_C__CLIENT":
                            $scope.exportClientSide();
                            break;
                            
                        default:
                            $scope.log("Formato de exportação não suportado:", $scope.layout.props.exportFormat);
                            $scope.exporting = false;
                            return false;
                    }
                }).catch(function(err) {
                    $scope.log("Erro ao processar hipercubo:", err);
                    $scope.exporting = false;
                });
            };
            
            // Exportação via servidor (OOXML, CSV_C, CSV_T)
            $scope.exportServerSide = function() {
                var exportOpts = {
                    format: $scope.layout.props.exportFormat,
                    state: $scope.layout.props.exportState,
                    filename: $scope.layout.props.exportFileName,
                    download: true
                };
                
                $scope.log("Exportando via servidor:", exportOpts.format);
                
                $scope.ext.model.exportData(
                    exportOpts.format,
                    "/qHyperCubeDef",
                    exportOpts.filename,
                    exportOpts.download
                ).then(function (retVal) {
                    if (exportOpts.download) {
                        var qUrl = retVal.result ? retVal.result.qUrl : retVal.qUrl;
                        var link = $scope.getBasePath() + qUrl;
                        window.open(link);
                        $scope.log("Download iniciado:", link);
                    }
                }).catch(function (err) {
                    $scope.log("Erro na exportação server-side:", err);
                }).finally(function () {
                    $scope.exporting = false;
                    $scope.log("Exportação server-side concluída");
                });
            };
            
            // Exportação client-side (CSV_C__CLIENT)
            $scope.exportClientSide = function() {
                $scope.log("Iniciando exportação client-side...");
                
                $scope.getAllData().then(function (data) {
                    $scope.log("Dados obtidos, processando...");
                    
                    var dataArray = $scope.dataToArray(
                        $scope.layout.qHyperCube.qDimensionInfo,
                        $scope.layout.qHyperCube.qMeasureInfo,
                        data
                    );
                    
                    $scope.arrayToCSVDownload(
                        dataArray,
                        $scope.layout.props.exportFileName || "export.csv"
                    );
                    
                    $scope.log("Exportação client-side concluída");
                }).catch(function (err) {
                    $scope.log("Erro na exportação client-side:", err);
                }).finally(function () {
                    $scope.exporting = false;
                });
            };
            
            // ========================================
            // OBTENÇÃO DE DADOS
            // ========================================
            
            // Obtém todos os dados do hipercubo otimizado para performance
            $scope.getAllData = function () {
                var qTotalData = [];
                var model = $scope.ext.model;
                var deferred = $q.defer();
                
                try {
                    // Calcula a largura baseada nas dimensões e medidas configuradas
                    var dimensions = $scope.layout.qDimensions || [];
                    var measures = $scope.layout.qMeasures || [];
                    var totalWidth = dimensions.length + measures.length;
                    
                    // Se não há configuração, usa largura padrão
                    if (totalWidth === 0) {
                        totalWidth = DEFAULT_WIDTH;
                    }
                    
                    $scope.log("Buscando dados com largura:", totalWidth, "e altura:", PAGE_SIZE);
                    
                    model.getHyperCubeData("/qHyperCubeDef", [{
                        qTop: 0,
                        qWidth: totalWidth,
                        qLeft: 0,
                        qHeight: PAGE_SIZE
                    }]).then(function (data) {
                        var columns = model.layout.qHyperCube.qSize.qcx;
                        var totalHeight = model.layout.qHyperCube.qSize.qcy;
                        var numberOfPages = Math.ceil(totalHeight / PAGE_SIZE);
                        
                        $scope.log("Registros por página:", PAGE_SIZE);
                        $scope.log("Total de registros:", totalHeight);
                        $scope.log("Número de páginas:", numberOfPages);
                        
                        if (numberOfPages === 1) {
                            // Dados cabem em uma página
                            if (data.qDataPages) {
                                deferred.resolve(data.qDataPages[0].qMatrix);
                            } else {
                                deferred.resolve(data[0].qMatrix);
                            }
                        } else {
                            // Dados precisam de múltiplas páginas
                            $scope.log("Iniciando paginação em:", new Date());
                            
                            var promises = Array.apply(null, new Array(numberOfPages)).map(function (data, index) {
                                var page = {
                                    qTop: PAGE_SIZE * index,
                                    qLeft: 0,
                                    qWidth: totalWidth,
                                    qHeight: PAGE_SIZE,
                                    index: index
                                };
                                
                                $scope.log("Página", (index + 1) + "/" + numberOfPages);
                                return model.getHyperCubeData("/qHyperCubeDef", [page]);
                            });
                            
                            $q.all(promises).then(function (data) {
                                // Consolida dados de todas as páginas
                                for (var j = 0; j < data.length; j++) {
                                    if (data[j].qDataPages) {
                                        for (var k1 = 0; k1 < data[j].qDataPages[0].qMatrix.length; k1++) {
                                            qTotalData.push(data[j].qDataPages[0].qMatrix[k1]);
                                        }
                                    } else {
                                        for (var k2 = 0; k2 < data[j][0].qMatrix.length; k2++) {
                                            qTotalData.push(data[j][0].qMatrix[k2]);
                                        }
                                    }
                                }
                                
                                $scope.log("Paginação concluída em:", new Date());
                                $scope.log("Total de registros consolidados:", qTotalData.length);
                                deferred.resolve(qTotalData);
                            }).catch(function(err) {
                                $scope.log("Erro na paginação:", err);
                                deferred.reject(err);
                            });
                        }
                    }).catch(function(err) {
                        $scope.log("Erro ao obter dados iniciais:", err);
                        deferred.reject(err);
                    });
                    
                } catch (error) {
                    $scope.log("Erro inesperado ao obter dados:", error);
                    deferred.reject(error);
                }
                
                return deferred.promise;
            };
            
            // ========================================
            // PROCESSAMENTO DE DADOS
            // ========================================
            
            // Converte dados para array
            $scope.dataToArray = function (dimensionInfo, measureInfo, data) {
                try {
                    var headers = [];
                    var table = [];
                    
                    // Adiciona cabeçalhos das dimensões
                    if (dimensionInfo && Array.isArray(dimensionInfo)) {
                        dimensionInfo.forEach(function (dimension) {
                            headers.push(dimension.qFallbackTitle || "Dimensão");
                        });
                    }
                    
                    // Adiciona cabeçalhos das medidas
                    if (measureInfo && Array.isArray(measureInfo)) {
                        measureInfo.forEach(function (measure) {
                            headers.push(measure.qFallbackTitle || "Medida");
                        });
                    }
                    
                    table.push(headers);
                    
                    // Adiciona dados
                    if (data && Array.isArray(data)) {
                        data.forEach(function (item) {
                            var row = [];
                            if (item && Array.isArray(item)) {
                                item.forEach(function (itemElem) {
                                    row.push(itemElem.qText || "");
                                });
                            }
                            table.push(row);
                        });
                    }
                    
                    $scope.log("Dados convertidos para array:", table.length, "linhas");
                    return table;
                    
                } catch (error) {
                    $scope.log("Erro ao converter dados para array:", error);
                    return [];
                }
            };
            
            // Converte array para CSV e faz download
            $scope.arrayToCSVDownload = function (arr, fileName) {
                try {
                    if (!arr || !Array.isArray(arr) || arr.length === 0) {
                        $scope.log("Array vazio ou inválido para conversão CSV");
                        return;
                    }
                    
                    var dataString = "";
                    
                    arr.forEach(function (infoArray) {
                        if (infoArray && Array.isArray(infoArray)) {
                            dataString += infoArray.join(",") + "\n";
                        }
                    });
                    
                    // Adiciona BOM para suporte a caracteres especiais
                    var BOM = "\ufeff";
                    var data = BOM + dataString;
                    var blob = new Blob([data], { type: "text/csv;charset=utf-8" });
                    
                    saveAs(blob, fileName);
                    $scope.log("CSV gerado e download iniciado:", fileName);
                    
                } catch (error) {
                    $scope.log("Erro ao gerar CSV:", error);
                }
            };
            
        }]
    };
});