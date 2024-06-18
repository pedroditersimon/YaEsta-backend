import { useState } from "react";

export function useFormCheckbox(initialValue, isDisabled) {
    const [value, setValue] = useState(initialValue);

    function handleChange(e) {
        setValue(e.target.checked);
    }

    function clear() {
        setValue(initialValue);
    }

    return {
        value,
        onChange: handleChange,
        clear,
        disabled: isDisabled
    };
}


export function useFormInput(initialValue, isDisabled) {
    const [value, setValue] = useState(initialValue);

    function handleChange(e) {
        setValue(e.target.value);
    }

    function clear() {
        setValue(initialValue);
    }

    return {
        value,
        onChange: handleChange,
        clear,
        disabled: isDisabled
    };
}
