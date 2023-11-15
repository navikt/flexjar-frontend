import { useState } from 'react';
import { Tag } from "@navikt/ds-react";

export const Tags = (): JSX.Element => {
    const [tags, setTags] = useState<string[]>(['example', 'example2']);
    const [inputValue, setInputValue] = useState('');

    const addTag = () : void => {
        setInputValue('');
    if (inputValue && !tags.includes(inputValue)) {
        setTags([...tags, inputValue]);

    }
};

    return (
        <div>
            {tags.length > 0 && tags.map((tag, index) => <Tag className={"p1"} variant={"info"} key={index}>{tag}</Tag>)}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={"border-2 border-gray-400"}
            />
            <button onClick={addTag}>Add Tag</button>
        </div>
    );
};
