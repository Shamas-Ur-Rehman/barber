!(function () {
    function injectStylesheet(file, node, callback) {
        var style = document.createElement("link");
        style.href = file;
        style.rel = 'stylesheet';
        style.onload = function () {
            if (callback) {
                callback(null, {
                    nodes: [this]
                });
            }
        };
        node = node || document.getElementsByTagName('head')[0];
        node.appendChild(style);
    }
    function injectScript(file, id, node, callback, error, remove) {
        node = node || document.getElementsByTagName("head")[0];
        if (node.querySelector('#' + id)) {
            if (callback) {
                callback(this);
            }
            return;
        };
        var script = document.createElement("script");
        script.src = file;
        script.id = id;
        script.onload = function () {
            remove && this.remove();
            if (callback) {
                callback(this);
            }
        };
        script.onerror = function () {
            remove && this.remove();
            if (error) {
                error(this);
            }
        };
        node.appendChild(script);
    }
    function getCollectionWithAPI(id) {
        return fetch('/api/commondata/GetCollection?collectionId=' + id).then(function (response) {
            return response.json();
        })
        /*            return new Promise(function(resolve, reject) {
                        Y.Data.get({
                            url: '/api/commondata/GetCollection?collectionId=' + id,
                            success: function(data) {
                                resolve(data);
                            },
                            failure: function(e) {
                                reject(e);
                            }
                        })
                    })*/
    }
    function createStyle(css, id, container) {
        var el = document.getElementById(id);
        if (!el) {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.id = id;
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            container.appendChild(style);
        } else {
            if (el.styleSheet) {
                if (el.styleSheet.cssText !== css) {
                    el.styleSheet.cssText = css;
                }
            } else {
                if (el.textContent !== css) {
                    el.textContent = css;
                }
            }
        }
    }
    var styles = '.show-cf-get-filter-config-button .universal-filter-button{display:block!important}.universal-filter-button{display: none!important}.cf-filter-config-modal{z-index: 100000000!important}.universal-filter-button {appearance: none;z-index:1000000!important;padding: 10px 14px;position: absolute;top:10px;left: 50%;transform: translateX(-50%);background-color:#000;color:#fff;font-size:14px;border:1px solid #fff;border-radius: 3px;transition: filter .2s;line-height:1;font-family:monospace!important;}.universal-filter-button:hover{filter:invert(1);}';
    createStyle(styles, 'universal-filter-admin-styles', document.getElementsByTagName('head')[0]);

    let FilterSelectors = 'body.collection-type-blog.view-list #page-body .main-content,.sqs-gallery-list .gallery-wrapper,.custom-table-inside,.gallery-section [data-controller*="Gallery"],.view-list .lessons-list .list-grid,.sqs-block-map,.user-items-list-item-container,.gallery-section [data-controller*="Gallery"],.portfolio-hover-items,#gridThumbs,.BlogList,.blog-list,.article-list,.ProductList:not(.ProductItem-relatedProducts),#productList,.view-list.collection-type-products .main-content-wrapper,.collection-type-products.view-list .list-grid,.sqs-events-collection-list,.view-list .page-section[class*="collection-type-blog-"] div[data-controller], .summary-v2-block,.sqs-block-gallery';
    let runned = false;
    function run() {
        if (runned) {
            console.log('Admin filer is already running...');
            return;

        } else {
            runned = true;
        }
        console.log('Admin Filter');
        let FilterContainers = window.document.querySelectorAll(FilterSelectors);
        if (FilterContainers && FilterContainers.length) {
            FilterContainers.forEach(function (f_container) {
                //console.log([f_container]);
                let FilterButton = f_container.querySelector('.universal-filter-button');
                if (!FilterButton) {
                    FilterButton = document.createElement('button');
                    FilterButton.className = 'universal-filter-button ';
                    FilterButton.textContent = 'Get Filter Config';
                    f_container.appendChild(FilterButton);
                    if (f_container.className && f_container.className.indexOf('main-content') > -1) {
                        f_container.style.position = 'relative';
                    }
                    FilterButton.onclick = function (e) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        //console.log('Filter button clicked', this.parentNode);
                        recognizeConfigByContainer(this.parentNode);
                    }
                }
            })
        }
        let showButton = localStorage.getItem('getFilterConfigButton');
        //console.log(1, showButton);
        if (showButton == null) {
            localStorage.setItem('getFilterConfigButton', true);
            showButton = 'true';
        }
        //console.log(showButton);
        showButton = showButton == 'true' ? true : false;
        //console.log('showButton', showButton);
        if (showButton) {
            document.body.classList.add('show-cf-get-filter-config-button');
        }
        injectScript('../utils/tingle-modal/tingle.min.js', 'tingle-modal-js');
        injectStylesheet('../utils/tingle-modal/tingle.min.css');
    }
    window.addEventListener('load', function () {
        run()
    }, false);
    if (document.readyState === 'complete') {
        run()
    }

    function getAllowedPrefSufTags(collectionUrl) {
        return new Promise(function (resolve, reject) {
            fetch(collectionUrl + '?format=json').then(function (response) {
                return response.json();
            }).then(function (data) {
                //console.log(data);
                var allowedPrefSufNames = [];
                if (data.collection && data.collection.tags && data.collection.tags.length) {
                    data.collection.tags.forEach(function (tag) {
                        var prefix = tag.trim().split(': ');
                        if (prefix[1] && allowedPrefSufNames.indexOf(prefix[0].trim()) == -1) {
                            allowedPrefSufNames.push(prefix[0].trim());
                        }
                    })
                }
                resolve(allowedPrefSufNames);
            }).catch(function (e) {
                console.warn(e);
                resolve([]);
            })
        })
    }

    function recognizeConfigByContainer(el) {
        const className = el.className;
        const dataset = el.dataset;
        let id = el.id;
        //console.log(className, dataset, id);
        if (dataset.blockType) {
            const JsonBlock = dataset.blockJson && JSON.parse(dataset.blockJson);
            if (dataset.blockType == '55') {
                //console.log('Summary block');
                if (JsonBlock && JsonBlock.collectionId) {
                    getCollectionWithAPI(JsonBlock.collectionId).then(function (coll_data) {
                        //console.log(coll_data);
                        if (coll_data.fullUrl) {
                            dataset.collectionUrl = coll_data.fullUrl;
                        }
                        getConfigForContainer('summary-block', el, '#' + id, dataset, className);
                    }).catch(function (e) {
                        console.log(e)
                    })
                } else {
                    getConfigForContainer('summary-block', el, '#' + id, dataset, className);
                }
            } else if (dataset.blockType == '8') {
                //console.log('Gallery block', dataset.blockJson);
                if (JsonBlock && JsonBlock.collectionId && JsonBlock.methodOption && JsonBlock.methodOption == 'existing') {
                    getCollectionWithAPI(JsonBlock.collectionId).then(function (coll_data) {
                        //console.log(coll_data);
                        if (coll_data.fullUrl) {
                            dataset.collectionUrl = coll_data.fullUrl;
                        }
                        getConfigForContainer('gallery-block', el, '#' + id, dataset, className);
                    }).catch(function (e) {
                        console.log(e)
                    })
                } else {
                    getConfigForContainer('gallery-block-internal', el, '#' + id, dataset, className);
                }
            }
            if (dataset.blockType == '44' && el.classList.contains('custom-table-inside')) {
                getConfigForContainer('table', el, '#' + id, dataset, className);
            }
            if (dataset.blockType == '4') {
                //console.log('Map block');
                getConfigForContainer('map-block', el, '#' + id, dataset, className);
            }
        } else {
            if (className.indexOf('blog-') > -1 && dataset.controller && dataset.controller.indexOf('Blog') > -1) {
                var collectionUrl = window.Static.SQUARESPACE_CONTEXT && window.Static.SQUARESPACE_CONTEXT.collection ? window.Static.SQUARESPACE_CONTEXT.collection.fullUrl : false;
                console.log('Collection URL', collectionUrl);
                if (!collectionUrl) {
                    getConfigForContainer('blog', el, '.view-list .page-section[class*="collection-type-blog-"] div[data-controller]', dataset, className);
                } else {
                    fetch(collectionUrl + '?format=json').then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        //console.log(data);
                        var allowedPrefSufNames = [];
                        if (data.collection && data.collection.tags && data.collection.tags.length) {
                            data.collection.tags.forEach(function (tag) {
                                var prefix = tag.trim().split(': ');
                                if (prefix[1] && allowedPrefSufNames.indexOf(prefix[0].trim()) == -1) {
                                    allowedPrefSufNames.push(prefix[0].trim());
                                }
                            })
                        }
                        dataset.allowedPrefSufNames = allowedPrefSufNames;
                        getConfigForContainer('blog', el, '.view-list .page-section[class*="collection-type-blog-"] div[data-controller]', dataset, className);
                    }).catch(function (e) {
                        console.warn(e);
                        getConfigForContainer('blog', el, '.view-list .page-section[class*="collection-type-blog-"] div[data-controller]', dataset, className);
                    })
                }
            } else if (className.indexOf('user-items-list-item-container') > -1) {
                var section_id = el.closest('[data-section-id]').getAttribute('data-section-id');

                getConfigForContainer('user-items-list', el, '[data-section-id="' + section_id + '"] .user-items-list-item-container', dataset, className);
            } else if (className.indexOf('BlogList') > -1 || className.indexOf('blog-list') > -1 || className.indexOf('article-list') > -1 || className.indexOf('main-content') > -1) {
                var collectionUrl = window.Static.SQUARESPACE_CONTEXT && window.Static.SQUARESPACE_CONTEXT.collection ? window.Static.SQUARESPACE_CONTEXT.collection.fullUrl : false;
                console.log('Collection URL', collectionUrl);
                if (!collectionUrl) {
                    getConfigForContainer('blog', el, '.BlogList,.blog-list,.article-list, body.collection-type-blog.view-list #page-body .main-content', dataset, className);
                } else {
                    fetch(collectionUrl + '?format=json').then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        //console.log(data);
                        var allowedPrefSufNames = [];
                        if (data.collection && data.collection.tags && data.collection.tags.length) {
                            data.collection.tags.forEach(function (tag) {
                                var prefix = tag.trim().split(': ');
                                if (prefix[1] && allowedPrefSufNames.indexOf(prefix[0].trim()) == -1) {
                                    allowedPrefSufNames.push(prefix[0].trim());
                                }
                            })
                        }
                        dataset.allowedPrefSufNames = allowedPrefSufNames;
                        getConfigForContainer('blog', el, '.BlogList,.blog-list,.article-list, body.collection-type-blog.view-list #page-body .main-content', dataset, className);
                    }).catch(function (e) {
                        console.warn(e);
                        getConfigForContainer('blog', el, '.BlogList,.blog-list,.article-list, body.collection-type-blog.view-list #page-body .main-content', dataset, className);
                    })
                }
                getConfigForContainer('blog', el, '.BlogList,.blog-list,.article-list, body.collection-type-blog.view-list #page-body .main-content', dataset, className);
            }
            else if (dataset.controller && dataset.controller.indexOf('Gallery') > -1) {
                getConfigForContainer('gallery-section', el, '.gallery-section [data-controller*="Gallery"]', dataset, className);
            }
            else if (className.indexOf('list-grid') > -1 && el.closest('.lessons-list')) {
                dataset.closedSubOptions = true;
                getConfigForContainer('lessons', el, '.view-list .lessons-list .list-grid', dataset, className);
            } else if (className.indexOf('list-grid') > -1) {
                dataset.controller = 'Products';
                dataset.closedSubOptions = true;
                var collectionUrl = el.querySelector('.hentry a') ? el.querySelector('.hentry a').getAttribute('href').split('https://assets.squarewebsites.org/p/')[0] : window.Static.SQUARESPACE_CONTEXT && window.Static.SQUARESPACE_CONTEXT.collection ? window.Static.SQUARESPACE_CONTEXT.collection.fullUrl : false;
                console.log('Collection URL', collectionUrl)
                if (!collectionUrl) {
                    getConfigForContainer('products', el, '.collection-type-products.view-list .list-grid', dataset, className);
                } else {
                    fetch(collectionUrl + '?format=json').then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        //console.log(data);
                        var allowedPrefSufNames = [];
                        if (data.collection && data.collection.tags && data.collection.tags.length) {
                            data.collection.tags.forEach(function (tag) {
                                var prefix = tag.trim().split(': ');
                                if (prefix[1] && allowedPrefSufNames.indexOf(prefix[0].trim()) == -1) {
                                    allowedPrefSufNames.push(prefix[0].trim());
                                }
                            })
                        }
                        dataset.allowedPrefSufNames = allowedPrefSufNames;
                        getConfigForContainer('products', el, '.collection-type-products.view-list .list-grid', dataset, className);
                    }).catch(function (e) {
                        console.warn(e);
                        getConfigForContainer('products', el, '.collection-type-products.view-list .list-grid', dataset, className);
                    })
                }
            }
            else if (className.indexOf('gallery-wrapper') > -1) {
                var collectionUrl = window.Static.SQUARESPACE_CONTEXT ? window.Static.SQUARESPACE_CONTEXT.collection.fullUrl : false;
                if (!collectionUrl) {
                    getConfigForContainer('gallery', el, '.sqs-gallery-list .gallery-wrapper', dataset, className);
                } else {
                    getAllowedPrefSufTags(collectionUrl).then(function (allowedPrefSufNames) {
                        console.log(allowedPrefSufNames);
                        if (allowedPrefSufNames && allowedPrefSufNames.length) {
                            dataset.allowedPrefSufNames = allowedPrefSufNames;
                        }
                        getConfigForContainer('gallery', el, '.sqs-gallery-list', dataset, className);
                    })
                }
            }
            else if (className.indexOf('sqs-events-collection-list') > -1) {
                getConfigForContainer('events', el, '.sqs-events-collection-list', dataset, className);
            } else if (id == 'gridThumbs') {
                getConfigForContainer('portfolio', el, '#gridThumbs', dataset, className);
            } else if (className.indexOf('portfolio-hover-items') > -1) {
                getConfigForContainer('portfolio', el, '.portfolio-hover-items', dataset, className);
            }
            else if (className.indexOf('ProductList') > -1 || id == 'productList' || className.indexOf('main-content-wrapper') > -1) {
                var collectionUrl = window.Static.SQUARESPACE_CONTEXT && window.Static.SQUARESPACE_CONTEXT.collection ? window.Static.SQUARESPACE_CONTEXT.collection.fullUrl : false;
                console.log('Collection URL', collectionUrl);
                if (!collectionUrl) {
                    getConfigForContainer('products', el, '.ProductList,#productList,.view-list.collection-type-products .main-content-wrapper', dataset, className);
                } else {
                    fetch(collectionUrl + '?format=json').then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        //console.log(data);
                        var allowedPrefSufNames = [];
                        if (data.collection && data.collection.tags && data.collection.tags.length) {
                            data.collection.tags.forEach(function (tag) {
                                var prefix = tag.trim().split(': ');
                                if (prefix[1] && allowedPrefSufNames.indexOf(prefix[0].trim()) == -1) {
                                    allowedPrefSufNames.push(prefix[0].trim());
                                }
                            })
                        }
                        dataset.allowedPrefSufNames = allowedPrefSufNames;
                        getConfigForContainer('products', el, '.ProductList,#productList,.view-list.collection-type-products .main-content-wrapper', dataset, className);
                    }).catch(function (e) {
                        console.warn(e);
                        getConfigForContainer('products', el, '.ProductList,#productList,.view-list.collection-type-products .main-content-wrapper', dataset, className);
                    })

                }
            }
        }
    }

    function fetchContent(url, container) {
        return fetch(url + '?format=main-content', { method: 'GET' }).then(function (r) { return r.text() })
    }

    function lookForRemoteContent() {
        let remotes = document.querySelectorAll('.remote-loadind');
        if (remotes && remotes.length) {
            remotes.forEach(function (remote) {
                let url = remote.getAttribute('data-url');
                if (url) {
                    fetchContent(url).then(function (content) {
                        if (content) {
                            remote.innerHTML = content;
                        }
                    }).catch(function (e) {
                        console.log(e);
                    })
                }
            })
        }
    }

    function getConfigForContainer(name, el, id, data, className) {
        //console.log(name, id, data, className);
        var popup = null;
        var modal = new tingle.modal({
            footer: true,
            stickyFooter: false,
            closeMethods: ['escape'],
            closeLabel: "Close",
            cssClass: ['cf-filter-config-modal'],
            onOpen: function () {
                //console.log('modal open');
                //lookForRemoteContent()
                //console.log(modal);
                popup = modal.getContent().querySelector('iframe');
                popup.onload = function (l) {
                    //console.log([this]);
                    this.contentWindow.postMessage({ name: name, id: id, data: { allowedPrefSufNames: data.allowedPrefSufNames, collectionUrl: data.collectionUrl, controller: data.controller, blockJson: data.blockJson, blockType: data.blockType }, className: className, command: 'initFilterCodes' }, '*')
                }
            },
            onClose: function () {
                //console.log('modal closed');
            },
            beforeClose: function () {
                // here's goes some logic
                // e.g. save content before closing the modal
                return true; // close the modal
                return false; // nothing happens
            }
        });
        // add another button
        modal.addFooterBtn('Close', 'tingle-btn tingle-btn--danger tingle-btn--pull-right', function () {
            // here goes some logic
            modal.close();
        });
        //<div class="remote-loadind" style="height:72vh" data-url="https://squarewebsites.org/universal-filter-summary-block-codes"></div>
        // set content
        modal.setContent('<iframe src="https://squarewebsites.org/universal-filter-' + name + '" style="border:0px #ffffff none;height:72vh" name="embedIFrame" scrolling="yes" frameborder="0" marginheight="0px" marginwidth="0px" height="600px" width="100%" allowfullscreen></iframe>');
        modal.open();
    }
    //popup.postMessage("hello there!", "http://example.com");

    function receiveMessage(event) {
        // Do we trust the sender of this message?  (might be
        // different from what we originally opened, for example). 
        if (event.origin !== "http://example.com/") {
            //return;
        }

        //console.log(event);
        // event.source is popup
        // event.data is "hi there yourself!  the secret response is: rheeeeet!"
    }
    window.addEventListener("message", receiveMessage, false);

    const toggleFunction = function (event) {
        //console.log(event)
        if (event.shiftKey && event.altKey && event.keyCode === 70) {

            let showButton = localStorage.getItem('getFilterConfigButton');
            showButton = (showButton == 'null' || showButton == 'true') ? true : false
            localStorage.setItem('getFilterConfigButton', !showButton);
            if (showButton) {
                document.body.classList.remove('show-cf-get-filter-config-button');
            } else {
                document.body.classList.add('show-cf-get-filter-config-button');
            }
            //console.log('showButton', showButton)
        }
    };
    window.addEventListener('keydown', toggleFunction, false);
    window.top.addEventListener('keydown', toggleFunction, false);
})();