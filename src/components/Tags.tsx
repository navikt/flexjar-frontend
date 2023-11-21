import { useState } from 'react'
import { Tag, UNSAFE_Combobox } from '@navikt/ds-react'

import { Feedback } from '../queryhooks/useFeedback'

export const Tags = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const [selectedTags, setSelectedTags] = useState<string[]>(feedback.tags)

    return (
        <div>
            <UNSAFE_Combobox
                allowNewValues
                label="Hva er dine favorittdrikker? Legg gjerne til flere alternativer."
                options={feedback.tags}
                isMultiSelect
                selectedOptions={selectedTags}
                onToggleSelected={(option, isSelected) => {
                    if (isSelected) {
                        setSelectedTags([...selectedTags, option])
                    } else {
                        setSelectedTags(selectedTags.filter((item) => item !== option))
                    }
                }
                }
            />
        </div>
    )
}
