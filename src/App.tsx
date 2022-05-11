// @ts-nocheck

import './App.css';
import React from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { ContainerSchema, LoadableObjectRecord, SharedMap, SharedSequence, SharedString } from "fluid-framework";
import { nanoid } from 'nanoid'
import { getMemberColor, getPlayer, getRandomInt, removeAt } from './utils';
const getFluidData = async () => {

  // Configure the container.
  const client = new TinyliciousClient();
  const containerSchema: ContainerSchema = {
    initialObjects: { sharedPile: SharedMap, sharedMembers: SharedMap } // map is [placement: Color]
  };

  // Get the container from the Fluid service.
  let container;
  const containerId = window.location.hash.substring(1);
  if (!containerId) {
    ({ container } = await client.createContainer(containerSchema));
    const id = await container.attach();
    container.initialObjects.sharedPile.set('pile', [])
    window.location.hash = id;
  } else {
    ({ container } = await client.getContainer(containerId, containerSchema));
  }
  // Return the Fluid timestamp object.
  return container.initialObjects;
}

const session = nanoid()
const player = getPlayer()
const color = getMemberColor(player)

function App() {
  const [fluidSharedObjects, setFluidSharedObjects] = React.useState<LoadableObjectRecord>();
  
  const [localPile, setLocalPile] = React.useState();
  const [localMembers, setLocalMembers] = React.useState();
  const [hand, setHand] = React.useState([1, 2, getRandomInt(1,9), getRandomInt(1,9), getRandomInt(1,9), getRandomInt(1,9), getRandomInt(1,9), getRandomInt(1,9), getRandomInt(1,9)])

  React.useEffect(() => {
    getFluidData()
      .then(data => { setFluidSharedObjects(data); return data })
      .then(({ sharedPile, sharedMembers }) => {
        console.log(`setting ${player} in shared Member`)
        sharedMembers.set(session, {session, color})
      });

    return () => {
      getFluidData()
        .then(({ sharedMembers }) => sharedMembers.delete(session))
    }
  }, []);

  // TODO: use the localPile deduced placement to drive to set the shared pile placement

  React.useEffect(() => {
    if (!fluidSharedObjects) {
      return // Do nothing because there is no Fluid SharedMap object yet.
    }

    // Set the value of the localPile state object that will appear in the UI.
    const { sharedPile, sharedMembers } = fluidSharedObjects;

    const updateLocalData = () => setLocalPile(sharedPile.get("pile"));
    updateLocalData();

    const updateLocalMembers = () => setLocalMembers(Array.from(sharedMembers.values()))
    updateLocalMembers();

    // Register handlers.
    sharedPile.on("valueChanged", updateLocalData);
    sharedMembers.on("valueChanged", updateLocalMembers);

    // Delete handler registration when the React App component is dismounted.
    return () => { 
      sharedPile.off("valueChanged", updateLocalData); 
      sharedMembers.off("valueChanged", updateLocalMembers) 
    }

  }, [fluidSharedObjects])

  if (localPile && localMembers) {
    return (
      <div className="App">
        <h3>Members</h3>
        <div className='members-container'>
        {
          localMembers.map(member => {
            return <div style={{color: member.color, margin: '10px'}}>{member.session}</div>
          })
        }
        </div>

        <h3>Shared Pile</h3>
        <div className="shared-pile-container">
          <span>{JSON.stringify(fluidSharedObjects.sharedPile.get('pile'))}</span>
        </div>

        <h3>Local Pile</h3>
        <div className="local-pile-container">
          <span>{JSON.stringify(localPile)}</span>
        </div>

        <h3>Hand</h3>
        <div className='hand-container'> 
        {
          hand.map((card, i) => {
            const disabled = localPile[localPile.length-1] === card
            return (
            <div 
              className={`card ${disabled? 'disabled' : ''}`} 
              style={{color}}
              onClick={() => {
                const pile = fluidSharedObjects.sharedPile.get('pile');
                console.log(pile[pile.length-1])
                if (disabled || pile[pile.length - 1] === card) {
                  return;
                }
                fluidSharedObjects.sharedPile.set("pile", [...localPile, card]);
                setHand(removeAt(hand, i));
              }}
            >
                {card}
            </div>)
          })
        }
        </div>

        <h3>Actions</h3>
        <div className="actions-container"> 
          <button onClick={() => fluidSharedObjects.sharedMembers.delete(session)}>Stop Playing</button>
          <button onClick={() => fluidSharedObjects.sharedPile.set("pile", [])}>Reset!</button>
        </div>
      </div>
    )
  } else {
    return <div />;
  }
}

export default App;