export const getQueueLabel = (queueId) => {
    switch(queueId) {
        case 420: return "Ranked Solo/Duo"
        case 440: return "Ranked Flex"
        case 400: return "Normal Draft"
        default: return "Unknown"
    }
}
