import { UNSAFE_Combobox } from '@navikt/ds-react'
import page from "@navikt/ds-react/src/layout/page/Page";

interface TagFilterProps {
    initialOptions: string[]
    selectedTags: string[]
    setSelectedTags: (newTags: string[]) => void
    setPage: (page: number) => void
}

export const TagFilter = ({ initialOptions, selectedTags, setSelectedTags, setPage }: TagFilterProps): JSX.Element => {
    const handleToggleSelected = (option: string | undefined, isSelected: boolean): void => {
        if (!option) return

        if (isSelected && !selectedTags.includes(option)) {
            setSelectedTags([...selectedTags, option])
        } else {
            setSelectedTags(selectedTags.filter((tag) => tag !== option))
        }
        setPage(1)
    }

    return (
        <div>
            <UNSAFE_Combobox
                label="Filter?"
                options={initialOptions}
                isMultiSelect
                selectedOptions={selectedTags}
                onToggleSelected={handleToggleSelected}
            />
        </div>
    )
}
