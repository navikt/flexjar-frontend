import { UNSAFE_Combobox } from '@navikt/ds-react'

interface TagFilterProps {
    initialOptions: string[]
    selectedTags: string[]
    setSelectedTags: (newTags: string[]) => void
}

export const TagFilter = ({ initialOptions, selectedTags, setSelectedTags }: TagFilterProps): JSX.Element => {
    const handleToggleSelected = (option: string | undefined, isSelected: boolean): void => {
        if (!option) return

        if (isSelected && !selectedTags.includes(option)) {
            setSelectedTags([...selectedTags, option])
        } else {
            setSelectedTags(selectedTags.filter((tag) => tag !== option))
        }
    }

    return (
        <div>
            <UNSAFE_Combobox
                label="Filter?"
                options={initialOptions}
                isMultiSelect
                onToggleSelected={handleToggleSelected}
            />
        </div>
    )
}
