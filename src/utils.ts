export const getPlayer = () => {
    let params = new URLSearchParams(window.location.search)
    return params.get('player') || params.get('p')
}

export const getMemberColor = (name: string) => {
    if (name === 'blue') {
        return '#0000ff'
    }

    if (name === 'red') {
        return '#ff0000'
    }

    if (name === 'green') {
        return '#00ff00'
    }

    return '#000000'
}

export const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

export const removeAt = <T>(arr: T[], index: number ) => {
    return [...arr.slice(0,index), ...arr.slice(index + 1)]
}

/**
 * Resolver answers how to local pile and hand should be
 * @param shared 
 * @param local 
 * @param hand 
 */
export const upstreamResolver = (shared: number[], stage: number[], stagedIndexOnHand: number, hand: number[]) => {
    // if shared is less length than stage, set shared, and remove hand at index
    // if shared is longer than stage, set stage.
    // if shared is same as stage, set stage, don't change hand.
}

export const downstreamResolver = (shared: number[], local: number[], hand: number[]) => {
    
}