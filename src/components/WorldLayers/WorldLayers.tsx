import * as React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { LayerService } from '../../services/LayerService';
import { WorldsActions } from '../../actions/world.actions';
import LayersDataTable from './LayersDataTable';
import { AFFILIATION_TYPES } from '../../consts/layer-types';
/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { ITBAction } from '../../consts/action-types';
import { WorldService } from '../../services/WorldService';
import { Route } from 'react-router';
import Layer from '../Layer/Layer';

export interface IPropsLayers {
    world: IWorld,
    updateWorld: (worlds: IWorld) => ITBAction
}

export interface IStateWorld {
    layers: IWorldLayer[]
}

class WorldLayers extends React.Component {
    props: IPropsLayers | any;

    // GET: get the world's layers on startUp
    componentWillMount() {
        if (!this.props.world.layers.length)  {
            LayerService.getAllLayersData(this.props.world.name)
                .then(layers => {
                    // get the input Data for all the world's layers (from the App store)
                    const layersInput = layers.map((layer: IWorldLayer) => this.getInputData(layer));
                    this.refresh([...layersInput]);               // update the App store
                })
                .catch(error => this.refresh([]));
        }
    };

    // get the input Data of the layer from the App store
    getInputData = (layer: IWorldLayer): IWorldLayer => {
        return {
            ...layer,
            inputData: layer.inputData || {
                affiliation: AFFILIATION_TYPES.AFFILIATION_UNKNOWN,
                GSD: 0,
                sensor: {
                    maker: '',
                    name: '',
                    bands: []
                },
                flightAltitude: 0,
                cloudCoveragePercentage: 0,
                zoom: 14
            }
        };
    };

    // update the App store and refresh the page
    refresh = (layers: IWorldLayer[]) => {
        console.log('World Home Page: REFRESH...');
        const name = this.props.world.name;
        this.props.updateWorld({ name, layers });
    };

    render() {
        const { world, match } = this.props;
        return (
            match.isExact ? <LayersDataTable worldName={world.name} layers={world.layers || []}/> : <Route path="/world/:worldName/layer/:layerName" component={Layer}/>
        );
    };
}

const mapStateToProps = (state: IState, { worldName, match }: any) => ({
    match,
    world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name)
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({ updateWorld: WorldsActions.updateWorldAction }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WorldLayers);

