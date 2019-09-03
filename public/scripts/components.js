class FileUploader extends HTMLElement {

    constructor() {
        super();

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
                        <style>
                            .container {
                                color: #212529;
                                border: 1px solid transparent;
                                padding: 0.5rem;
                            }
                            .container--active {
                                border: 1px dashed #ced4da;
                            }
                            .button {
                                color: #007bff;
                                text-decoration: none;
                            }

                            .progress {
                                display: -webkit-box;
                                display: -ms-flexbox;
                                display: flex;
                                overflow: hidden;
                                font-size: .75rem;
                                background-color: #e9ecef;
                                border-radius: .25rem;
                                height: 2px;
                            }
                            .progress-bar {
                                display: -webkit-box;
                                display: -ms-flexbox;
                                display: flex;
                                -webkit-box-orient: vertical;
                                -webkit-box-direction: normal;
                                -ms-flex-direction: column;
                                flex-direction: column;
                                -webkit-box-pack: center;
                                -ms-flex-pack: center;
                                justify-content: center;
                                color: #fff;
                                text-align: center;
                                background-color: #007bff;
                                transition: width .6s ease;
                            }
                            .progress-message {
                                font-size: 80%;
                                color: #6c757d;
                            }
                        </style>
                        <div data-container class="container">
                            <a href="#" data-button class="button">Select or drag images</a>
                            <div data-progress-bar class="progress">
                                <div class="progress-bar"></div>
                            </div>
                            <small data-progress-message class="progress-message">&nbsp;</small>
                            <slot></slot>
                        </div>
                    `;
        this.shadowRoot.querySelector('[data-button]').addEventListener('click', this.selectFile.bind(this));
        this.shadowRoot.querySelector('[data-container]').addEventListener('drop', this.onDropFile.bind(this));
        this.shadowRoot.querySelector('[data-container]').addEventListener('dragover', this.isDragOver.bind(this));
        this.shadowRoot.querySelector('[data-container]').addEventListener('dragenter', this.isDragOver.bind(this));
        this.shadowRoot.querySelector('[data-container]').addEventListener('dragleave', this.isNotDragOver.bind(this));
        this.shadowRoot.querySelector('[data-container]').addEventListener('dragend', this.isNotDragOver.bind(this));
    }

    selectFile(event) {
        event.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.style.position = 'absolute';
        input.style.top = '-10000px';
        input.addEventListener('change', (event) => {
            event.preventDefault();
            this.upload(event.target.files)
        });
        this.shadowRoot.appendChild(input);
        input.click();
    }

    upload(files) {
        const formData = new FormData();

        for (let i = 0; files.length > i; i++) {
            formData.append(`image${i}`, files[i]);
        }

        const progressbar = this.shadowRoot.querySelector('[data-progress-bar] > div');
        const progressmessage = this.shadowRoot.querySelector('[data-progress-message]');

        const xhr = new XMLHttpRequest();
        xhr.open('post', '/image');
        xhr.upload.addEventListener("progress", (e) => {
            progressbar.style.width = `${(e.loaded * 100.0 / e.total) || 100}%`;
        });
        xhr.upload.addEventListener("loadstart", (e) => {
            progressbar.style.width = `0%`;
            progressbar.style.backgroundColor = '#007bff';
            progressmessage.innerHTML = 'Uploading';
        });
        xhr.upload.addEventListener("loadend", (e) => {
            progressbar.style.width = `100%`;
            progressmessage.innerHTML = 'Processing images';
        });
        xhr.addEventListener('error', () => {
            progressbar.style.backgroundColor = '#d7352b';
            progressmessage.innerHTML = 'Error';
        });
        xhr.addEventListener('load', (event) => {
            if (event.target.status === 200) {
                try {
                    const result = JSON.parse(event.target.response);
                    progressbar.style.backgroundColor = '#28d776';
                    progressmessage.innerHTML = 'Done';

                    this.dispatchEvent(
                        new CustomEvent('result', {
                            detail: result
                        })
                    );
                } catch (e) {
                    progressbar.style.backgroundColor = '#d7352b';
                    progressmessage.innerHTML = 'Error';
                }
            } else {
                progressbar.style.backgroundColor = '#d7352b';
                progressmessage.innerHTML = 'Error';
            }
        });
        xhr.send(formData);
    }

    onDropFile(event) {
        const isFile = Array.from(event.dataTransfer.items).some(item => {
            return item.kind === 'file'
        });

        if (!isFile) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.shadowRoot.querySelector('[data-container]').classList.remove('container--active');
        this.upload(event.dataTransfer.files);
    }

    isDragOver(event) {
        const isFile = Array.from(event.dataTransfer.items).some(item => {
            return item.kind === 'file'
        });

        if (!isFile) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.shadowRoot.querySelector('[data-container]').classList.add('container--active');
    }

    isNotDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.shadowRoot.querySelector('[data-container]').classList.remove('container--active');
    }
}

window.customElements.define('file-uploader', FileUploader);

class ImageDisplay extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
            <style>
                
                textarea {
                    box-sizing: border-box;
                    display: block;
                    width: 100%;
                    padding: .375rem .75rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    color: #495057;
                    background-color: #fff;
                    background-clip: padding-box;
                    border: 1px solid #ced4da;
                    border-radius: .25rem;
                    transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
                }
                textarea:focus {
                    color: #495057;
                    background-color: #fff;
                    border-color: #80bdff;
                    outline: 0;
                    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
                }
                
                
                
                
                
                
                .card {
                    position: relative;
                    display: -ms-flexbox;
                    display: flex;
                    -ms-flex-direction: column;
                    flex-direction: column;
                    min-width: 0;
                    word-wrap: break-word;
                    background-color: #fff;
                    background-clip: border-box;
                    border: 1px solid rgba(0,0,0,.125);
                    border-radius: .25rem;
                }
                .card-img-top {
                    width: 100%;
                    border-top-left-radius: calc(.25rem - 1px);
                    border-top-right-radius: calc(.25rem - 1px);
                }
                .card-body {
                    -ms-flex: 1 1 auto;
                    flex: 1 1 auto;
                    padding: 1.25rem;
                }
                
                
                
            </style>
            
            
            <div class="card">
                <slot name="icon"></slot>
                <div class="card-body">
                    <textarea placeholder="Write a description..."></textarea>
                    <button>save</button>
                    <slot name="control"></slot>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        const button = this.shadowRoot.querySelector('button');

        this.shadowRoot.querySelector('textarea').value = this.getAttribute('text');
        button.addEventListener('click', event => {
            event.preventDefault();
            button.setAttribute('disabled', '');
            const form = new FormData();
            form.set('description', this.shadowRoot.querySelector('textarea').value);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.getAttribute('path'));
            xhr.addEventListener('load', e => {
                button.removeAttribute('disabled');
            });
            xhr.addEventListener('error', e => {
                button.removeAttribute('disabled');
            });
            xhr.send(form);
        })
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        switch (attrName) {
            case 'text':
                this.shadowRoot.querySelector('textarea').value = newVal;
                break;
        }
    }

    set path(path) {
        this.setAttribute('path', path);
    }

    set text(text) {
        this.setAttribute('text', text);
    }


    static get observedAttributes() {
        return ['path', 'text'];
    }
}

customElements.define('image-display', ImageDisplay);

class AuthorSelect extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
            <style>
                .form-control:focus {
                    color: #495057;
                    background-color: #fff;
                    border-color: #80bdff;
                    outline: 0;
                    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
                }
                .form-control {
                    overflow: visible;
                    display: block;
                    width: 100%;
                    padding: .375rem .75rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    color: #495057;
                    background-color: #fff;
                    background-clip: padding-box;
                    border: 1px solid #ced4da;
                    border-radius: .25rem;
                    transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
                }
                .list-group {
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-orient: vertical;
                    -webkit-box-direction: normal;
                    -ms-flex-direction: column;
                    flex-direction: column;
                    padding-left: 0;
                    margin-bottom: 0
                }
                .list-group-item:first-child {
                    border-top-left-radius: .25rem;
                    border-top-right-radius: .25rem;
                }
                .list-group-item {
                    position: relative;
                    display: block;
                    padding: .75rem 1.25rem;
                    margin-bottom: -1px;
                    background-color: #fff;
                    border: 1px solid rgba(0,0,0,.125);
                    cursor: pointer;
                }
                .list-group-item-success {
                    color: #155724;
                    background-color: #c3e6cb
                }
            </style>
            <input type="search" 
                class="form-control" 
                aria-describedby="search" 
                placeholder="Search for Author..." />
            <ul data-author-search-result class="list-group"></ul>
        `;
        shadowRoot.querySelector('[type=search]').addEventListener('keyup', this.throttle(this.searchAuthor, 500));
        shadowRoot.querySelector('[type=search]').addEventListener('search', this.clearAuthEntries);
    }

    createElement = (value) => {
        const resultItem = document.createElement('li');
        resultItem.classList.add('list-group-item');
        const resultItemSpan = document.createElement('span');
        resultItemSpan.appendChild(document.createTextNode(value));
        resultItem.appendChild(resultItemSpan);

        return resultItem;
    };

    searchAuthor = (inputEvent) => {
        const value = inputEvent.target.value;
        fetch(`/api/author/search?q=${inputEvent.target.value}`)
            .then(response => response.json())
            .then(json => {
                this.clearAuthEntries();
                return json;
            })
            .then(json => {
                json.forEach(item => {
                    const resultItem = this.createElement(item.name);
                    resultItem.addEventListener('click', () => {
                        const customEvent = new CustomEvent('select', {
                            bubbles: true,
                            detail: { author: item }
                        });
                        this.dispatchEvent(customEvent);
                        this.clearInput();
                        this.clearAuthEntries();
                    });

                    this.shadowRoot.querySelector('[data-author-search-result]').appendChild(resultItem);
                });

                if (value.length > 0) {
                    const newButton = this.createElement('Create New');
                    newButton.classList.add('list-group-item-success');

                    newButton.addEventListener('click', () => {
                        this.createAuthEntry(value)
                            .then(author => {
                                this.clearInput();
                                const customEvent = new CustomEvent('select', {
                                    bubbles: true,
                                    detail: { author: author }
                                });
                                this.dispatchEvent(customEvent);
                                this.clearAuthEntries();
                            })
                            .catch(console.error);
                    });

                    this.shadowRoot.querySelector('[data-author-search-result]').appendChild(newButton);
                }
            });
    };

    clearInput = () => {
        this.shadowRoot.querySelector('[type=search]').value = '';
    };

    clearAuthEntries = () => {
        this.shadowRoot.querySelector('[data-author-search-result]').innerHTML = '';
    };

    createAuthEntry = (name) => {
        const formData = new FormData();
        formData.append('name', name);

        return fetch('/update/author', {
            method: 'POST',
            headers: {
                'X-REQUESTED-WITH': 'xmlhttprequest',
            },
            body: formData
        }).then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        }).then(response => {
            return response.json();
        }).catch(error => {
            console.log(Error(error.toString()));
        });

    };

    throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit)
            }
        }
    }
}

customElements.define('author-select', AuthorSelect);


const getMouseOffset = (evt) => {
    const targetRect = evt.target.getBoundingClientRect()
    const offset = {
        x: evt.pageX - targetRect.left,
        y: evt.pageY - targetRect.top
    }
    return offset
}

const getElementVerticalCenter = (el) => {
    const rect = el.getBoundingClientRect()
    return (rect.bottom - rect.top) / 2
}

function sortable(rootEl, onUpdate) {
    var dragEl;

    // Function responsible for sorting
    function _onDragOver(evt) {
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'move';

        var target = evt.target.closest('[draggable=true]');
        if (target && target !== dragEl && target.draggable === true) {
            // Sorting
            const offset = getMouseOffset(evt)
            const middleY = getElementVerticalCenter(evt.target)

            if (offset.y > middleY) {
                rootEl.insertBefore(dragEl, target.nextSibling)
            } else {
                rootEl.insertBefore(dragEl, target)
            }
        }
    }

    // End of sorting
    function _onDragEnd(evt){
        evt.preventDefault();

        dragEl.classList.remove('ghost');
        rootEl.removeEventListener('dragover', _onDragOver, false);
        rootEl.removeEventListener('dragend', _onDragEnd, false);


        // Notification about the end of sorting
        onUpdate(dragEl);
    }

    // Sorting starts
    rootEl.addEventListener('dragstart', function (evt){
        dragEl = evt.target; // Remembering an element that will be moved

        // Limiting the movement type
        evt.dataTransfer.effectAllowed = 'move';
        evt.dataTransfer.setData('Text', dragEl.textContent);


        // Subscribing to the events at dnd
        rootEl.addEventListener('dragover', _onDragOver, false);
        rootEl.addEventListener('dragend', _onDragEnd, false);


        setTimeout(function () {
            // If this action is performed without setTimeout, then
            // the moved object will be of this class.
            dragEl.classList.add('ghost');
        }, 0)
    }, false);
}


const markdownFormat = (event) => {

    if (!event.metaKey) {
        return;
    }

    if (event.target.selectionEnd - event.target.selectionStart <= 0) {
        return;
    }

    const selectionStart = event.target.selectionStart;
    const selectionEnd = event.target.selectionEnd;
    let selectionOffset = 0;
    const beginning = event.target.value.substring(0, event.target.selectionStart);
    const middle = event.target.value.substring(event.target.selectionStart, event.target.selectionEnd);
    const end = event.target.value.substring(event.target.selectionEnd);
    const scroll = event.target.scrollTop;

    let value = '';

    switch (event.key) {
        case 'b':
            value = `${beginning}**${middle}**${end}`;
            selectionOffset = 4;
            break;
        case 'i':
            value = `${beginning}_${middle}_${end}`;
            selectionOffset = 2;
            break;
    }

    event.target.value = value;
    event.target.setSelectionRange(selectionEnd + selectionOffset,selectionEnd + selectionOffset);
    event.target.scrollTo(0, scroll);

    return false;
};

const disable = (event) => {
    if (event.metaKey && (
        event.key === '1' || event.key === '2' || event.key === '3' ||
        event.key === '4' || event.key === '5' || event.key === '6'
    )) {
        event.cancelBubble = true;
        event.preventDefault();
        event.stopImmediatePropagation();

        const selectionStart = event.target.selectionStart;
        const scroll = event.target.scrollTop;
        let location = (event.target.selectionStart - 1);

        while (location > 0) {
            if (event.target.value[location] === '\n') {
                break;
            }
            location--;
        }

        location = location === 0 ? 0 : location + 1;

        const begin = event.target.value.substring(0, location);
        const end = event.target.value.substring(location);

        event.target.value = `${begin}${"#".repeat(Number(event.key))} ${end}`;
        event.target.setSelectionRange(selectionStart, selectionStart);
        event.target.scrollTo(0, scroll);
    }

    if (event.metaKey && (event.key === 'a')) {
        event.cancelBubble = true;
        event.preventDefault();
        event.stopImmediatePropagation();

        const selectionStart = event.target.selectionStart;
        const scroll = event.target.scrollTop;
        let location = (event.target.selectionStart - 1);

        while (location > 0) {
            if (event.target.value[location] === '\n') {
                break;
            }
            location--;
        }

        location = location === 0 ? 0 : location + 1;

        const begin = event.target.value.substring(0, location);
        const end = event.target.value.substring(location);

        event.target.value = `${begin}> ${end}`;
        event.target.setSelectionRange(selectionStart+2, selectionStart+2);
        event.target.scrollTo(0, scroll);
    }

    if (event.metaKey && (event.key === 'l')) {
        event.cancelBubble = true;
        event.preventDefault();
        event.stopImmediatePropagation();

        const scroll = event.target.scrollTop;
        let location = (event.target.selectionStart - 1);

        while (location > 0) {
            if (event.target.value[location] === '\n') {
                break;
            }
            location--;
        }

        location = location === 0 ? 0 : location + 1;

        const beginning = event.target.value.substring(0, location);
        const middle = event.target.value.substring(location, event.target.selectionEnd);
        const end = event.target.value.substring(event.target.selectionEnd);

        const items = middle.split('\n').map(item => `\n* ${item}`);

        event.target.value = `${beginning}${items.join('')}${end}`;
        event.target.setSelectionRange(location + 1, location + 1);
        event.target.scrollTo(0, scroll);
    }
    return false;
};


document.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('textarea')).forEach(textarea => {
        textarea.addEventListener('focus', () => {
            window.addEventListener('keydown', disable);
            textarea.addEventListener('keypress', markdownFormat);
        });
        textarea.addEventListener('blur', () => {
            window.removeEventListener('keydown', disable);
            textarea.removeEventListener('keypress', markdownFormat);
        });
    });
});


