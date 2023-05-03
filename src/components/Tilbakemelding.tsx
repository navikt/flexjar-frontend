import { Button, Heading, Label, Textarea } from '@navikt/ds-react'
import cl from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export enum HelpfulArticleEnum {
    'JA' = 'ja',
    'DELVIS' = 'delvis',
    'NEI' = 'nei',
    'MISC' = 'misc',
}

export const Tilbakemelding = ({
    center,
    akselFeedback = false,
}: {
    docId?: string
    docType?: string
    center?: boolean
    akselFeedback?: boolean
}): JSX.Element => {
    const { asPath } = useRouter()
    const queryClient = useQueryClient()

    const [textValue, setTextValue] = useState('')
    const [activeState, setActiveState] = useState<HelpfulArticleEnum | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const timeoutTimer = useRef<number | null>()
    const [thanksFeedback, setThanksFeedback] = useState<boolean>(false)
    const textAreaRef = useRef(null)
    const [, setHasLoggedFeedback] = useState(false)

    const fetchFeedback = async (): Promise<void> => {
        if (activeState === null) {
            return
        }

        const body = {
            feedback: textValue,
            feedbackId: 'test-' + activeState,
            app: 'flexjar-frontend',
        }

        await fetch('/api/flexjar-backend/api/v1/feedback/azure', {
            method: 'POST',
            body: JSON.stringify(body),
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSend = (e: any): (() => void) | void => {
        e.preventDefault()

        if (textValue === '') {
            setErrorMsg('Tilbakemeldingen kan ikke være tom. Legg til tekst i feltet.')
            return
        }
        setErrorMsg(null)
        fetchFeedback().then(() => {
            queryClient.invalidateQueries(['feedback'])
        })

        setHasLoggedFeedback(true)

        setActiveState(null)
        setTextValue('')
        setThanksFeedback(true)
        timeoutTimer.current = window.setTimeout(() => {
            setThanksFeedback(false)
        }, 6000)

        return () => {
            if (timeoutTimer.current) {
                window.clearTimeout(timeoutTimer.current)
                timeoutTimer.current = null
            }
        }
    }

    useEffect(() => {
        textValue && errorMsg && setErrorMsg(null)
    }, [textValue, errorMsg])

    useEffect(() => {
        if (timeoutTimer.current && activeState) {
            setThanksFeedback(false)
            window.clearTimeout(timeoutTimer.current)
            timeoutTimer.current = null
        }
    }, [activeState])

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        activeState && textAreaRef.current && (textAreaRef.current as any).focus()
        setErrorMsg(null)
    }, [activeState])

    useEffect(() => {
        setActiveState(null)
        setTextValue('')
        setThanksFeedback(false)

        if (timeoutTimer.current) {
            window.clearTimeout(timeoutTimer.current)
            timeoutTimer.current = null
        }
    }, [asPath])

    const getPlaceholder = (): string => {
        switch (activeState) {
            case HelpfulArticleEnum.JA:
                return 'Hva vil du trekke frem?'
            case HelpfulArticleEnum.DELVIS:
                return 'Hva er det som mangler?'
            case HelpfulArticleEnum.NEI:
                return 'Hva er det du ikke liker?'
            case HelpfulArticleEnum.MISC:
                return 'Hva kan forbedres?'
            default:
                return 'Hva kan forbedres?'
        }
    }

    const classes = akselFeedback
        ? 'toc-ignore scroll-my-[30vh]'
        : cl('scroll-my-[30vh] toc-ignore mt-12 mb-28', {
              'mx-auto': center,
          })

    return (
        <div className={classes} id="feedback-block" data-hj-suppress>
            <div
                className={cl('flex w-full flex-col gap-4', {
                    '': akselFeedback,
                    'items-center': center,
                })}
            >
                <Heading size="small" level="2" className={cl({ 'text-deepblue-700': akselFeedback })}>
                    Var denne siden nyttig?
                </Heading>
                <div
                    className={cl('flex w-full gap-4', {
                        'justify-start': akselFeedback,
                        'justify-center': center,
                    })}
                >
                    <Button
                        variant="secondary"
                        className={cl({
                            'bg-deepblue-800 text-text-on-inverted ring-2 ring-inset ring-deepblue-800 focus-visible:shadow-focus focus-visible:ring-1 focus-visible:ring-white':
                                activeState === HelpfulArticleEnum.JA,
                        })}
                        onClick={() =>
                            setActiveState((x) => (x === HelpfulArticleEnum.JA ? null : HelpfulArticleEnum.JA))
                        }
                    >
                        <Label as="span">Ja</Label>
                    </Button>
                    <Button
                        variant="secondary"
                        className={cl({
                            'bg-deepblue-800 text-text-on-inverted ring-2 ring-inset ring-deepblue-800 focus-visible:shadow-focus focus-visible:ring-1 focus-visible:ring-white':
                                activeState === HelpfulArticleEnum.NEI,
                        })}
                        onClick={() =>
                            setActiveState((x) => (x === HelpfulArticleEnum.NEI ? null : HelpfulArticleEnum.NEI))
                        }
                    >
                        <Label as="span">Nei</Label>
                    </Button>
                    <Button
                        variant="secondary"
                        className={cl({
                            'bg-deepblue-800 text-text-on-inverted ring-2 ring-inset ring-deepblue-800 focus-visible:shadow-focus focus-visible:ring-1 focus-visible:ring-white':
                                activeState === HelpfulArticleEnum.MISC,
                        })}
                        onClick={() =>
                            setActiveState((x) => (x === HelpfulArticleEnum.MISC ? null : HelpfulArticleEnum.MISC))
                        }
                        id="feedback-forbedringer-button"
                    >
                        <Label as="span">Foreslå forbedring</Label>
                    </Button>
                </div>
                {activeState !== null && (
                    <form className={cl('animate-fadeIn mt-4 flex w-full max-w-sm flex-col gap-4')}>
                        <Textarea
                            ref={textAreaRef}
                            error={errorMsg}
                            label={getPlaceholder()}
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            maxLength={600}
                            minRows={3}
                            description="Ikke skriv inn navn eller andre personopplysninger"
                        />
                        <Button className="mr-auto" onClick={handleSend}>
                            Send inn svar
                        </Button>
                    </form>
                )}
                <div aria-live="polite">
                    {thanksFeedback && (
                        <Heading size="small" as="p" className="mt-8">
                            Takk for tilbakemeldingen!
                        </Heading>
                    )}
                </div>
            </div>
        </div>
    )
}
