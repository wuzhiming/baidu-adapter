const EditBox = cc.EditBox;

if (EditBox && EditBox._EditBoxImpl) {
    var KeyboardReturnType = EditBox.KeyboardReturnType;
    var _currentEditBoxImpl = null;

    function getKeyboardReturnType (type) {
        switch (type) {
            case KeyboardReturnType.DEFAULT:
            case KeyboardReturnType.DONE:
                return 'done';
            case KeyboardReturnType.SEND:
                return 'send';
            case KeyboardReturnType.SEARCH:
                return 'search';
            case KeyboardReturnType.GO:
                return 'go';
            case KeyboardReturnType.NEXT:
                return 'next';
        }
        return 'done';
    }

    function updateLabelsVisibility(editBox) {
        let displayText = editBox._impl._text;
        let textLabel = editBox._textLabel;
        let placeholderLabel = editBox._placeholderLabel;
  
        if (textLabel) {
            textLabel.node.active = displayText !== '';
        }
        if (placeholderLabel) {
            placeholderLabel.node.active = displayText === '';
        }
    }

    Object.assign(EditBox.prototype, {
        editBoxEditingDidBegan () {
            cc.Component.EventHandler.emitEvents(this.editingDidBegan, this);
            this.node.emit('editing-did-began', this);
        },

        editBoxEditingDidEnded () {
            cc.Component.EventHandler.emitEvents(this.editingDidEnded, this);
            this.node.emit('editing-did-ended', this);
        },

        _updateStayOnTop () {
            // baidu_game not support
        },
    });

    Object.assign(EditBox._EditBoxImpl.prototype, {
        setFocus () {
            this._beginEditing();
        },

        isFocused () {
            return this._editing;
        },

        setInputMode (inputMode) {
            this._inputMode = inputMode;
        },

        _beginEditing () {
            this.createInput();
        },

        _endEditing () {
            this._delegate && this._delegate.editBoxEditingDidEnded();
            this._editing = false;
        },

        createInput () {
            // Unregister keyboard event listener in old editBoxImpl if keyboard haven't hidden.
            if (_currentEditBoxImpl !== this) {
                if (_currentEditBoxImpl) {
                    _currentEditBoxImpl._endEditing();
                    swan.offKeyboardConfirm(_currentEditBoxImpl.onKeyboardConfirmCallback);
                    swan.offKeyboardInput(_currentEditBoxImpl.onKeyboardInputCallback);
                    swan.offKeyboardComplete(_currentEditBoxImpl.onKeyboardCompleteCallback);
                }
                _currentEditBoxImpl = this;
            }

            var multiline = this._inputMode === EditBox.InputMode.ANY;
            var editBoxImpl = this;
            this._editing = true;

            function onKeyboardConfirmCallback (res) {
                editBoxImpl._text = res.value;
                editBoxImpl._delegate && editBoxImpl._delegate.editBoxEditingReturn && editBoxImpl._delegate.editBoxEditingReturn();
                swan.hideKeyboard({
                    success: function (res) {
                        
                    },
                    fail: function (res) {
                        cc.warn(res.errMsg);
                    }
                });
            }

            function onKeyboardInputCallback (res) {        
                if (res.value.length > editBoxImpl._maxLength) {
                    res.value = res.value.slice(0, editBoxImpl._maxLength);
                }
                if (editBoxImpl._delegate && editBoxImpl._delegate.editBoxTextChanged) {
                    if (editBoxImpl._text !== res.value) {
                        editBoxImpl._text = res.value;
                        editBoxImpl._delegate.editBoxTextChanged(editBoxImpl._text);
                        updateLabelsVisibility(editBoxImpl._delegate);
                    }
                }
            }

            function onKeyboardCompleteCallback () {
                editBoxImpl._endEditing();
                swan.offKeyboardConfirm(onKeyboardConfirmCallback);
                swan.offKeyboardInput(onKeyboardInputCallback);
                swan.offKeyboardComplete(onKeyboardCompleteCallback);
                _currentEditBoxImpl = null;
            }
            
            swan.showKeyboard({
                defaultValue: editBoxImpl._text,
                maxLength: editBoxImpl._maxLength,
                multiple: multiline,
                confirmHold: false,  // hide keyboard mannually by swan.onKeyboardConfirm
                confirmType: getKeyboardReturnType(editBoxImpl._returnType),
                success: function (res) {
                    editBoxImpl._delegate && editBoxImpl._delegate.editBoxEditingDidBegan && editBoxImpl._delegate.editBoxEditingDidBegan();
                },
                fail: function (res) {
                    cc.warn(res.errMsg);
                    editBoxImpl._endEditing();
                }
            });
            swan.onKeyboardConfirm(onKeyboardConfirmCallback);
            swan.onKeyboardInput(onKeyboardInputCallback);
            swan.onKeyboardComplete(onKeyboardCompleteCallback);
        },
    });
}