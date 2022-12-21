import logo from './logo.svg';
import './App.css';
import * as d3 from 'd3';
import React, { useEffect } from 'react';
import ScatterPlot from './components/ScatterPlot';
import { cluster, filter } from 'd3';


function App() {

    var clusterMaker = require('clusters');

    function useFirstRender() {
        const firstRender= React.useRef(true);

        useEffect(() => {
            firstRender.current = false;
        }, []);

        return firstRender.current;
    } 

    const firstRender = useFirstRender();

    var [dataset, setDataset] = React.useState(1);
    var [tmpdata, settmpData] = React.useState([]);
    var [data, setData] = React.useState([]);
    var [n_clus, set_n_clus] = React.useState(3);
    var [n_iters, set_n_iters] = React.useState(1000);
    var clusters = [];
    var processed = [];
    var [update_t, setupdatet] = React.useState(-1);
    var [radius, setRadius] = React.useState(6)

    
    React.useEffect(() => {
        loadData();
        if (!(firstRender || tmpdata == [])) {
            processData();
        }
    },[firstRender, dataset])

    const loadData = () => {
        if (dataset == 1) {
            // data adapted from CSC3020
            d3.csv('./generatedData.csv') 
            .then(_data => {
                settmpData(_data.map(d => {
                    d.width = +d.width;
                    d.length = +d.length;   
                    return [d.length, d.width]
                }));
            })
        }
        else if (dataset == 2) {
            // data adapted from figshare
            d3.csv('./kmeans_blobs.csv') 
            .then(_data => {
                settmpData(_data.map(d => {
                    d.x = +d.x;
                    d.y = +d.y;   
                    return [d.x, d.y]
                }));
            })
        }
        else if (dataset == 3) {
            // data randomly generated
            d3.csv('./randomdata.csv') 
            .then(_data => {
                settmpData(_data.map(d => {
                    d.x = +d.x;
                    d.y = +d.y;   
                    return [d.x, d.y]
                }));
            })
        }
    }

    const processData = () => {
        clusterMaker.k(n_clus);
        clusterMaker.iterations(n_iters);
        clusterMaker.data(tmpdata)
        clusters = clusterMaker.clusters()
        for (var i=0; i<clusters.length; i++){
            for (var j=0; j<clusters[i].points.length;j++){
                var tmp = {
                    "length": clusters[i].points[j][0],
                    "width": clusters[i].points[j][1],
                    "cluster": i
                }
                processed.push(tmp)
            }
        }
        setData(processed);
    }

    React.useEffect(() => {
        if (!(firstRender || tmpdata == [])) {
            processData();
        }
    },[update_t, tmpdata])

    const updateparam = () => {
        var C = document.getElementById("n_clusters")
        var I = document.getElementById("n_iters")
        set_n_clus(C.value)
        set_n_iters(I.value)
        setupdatet(-1*update_t)
    }

    const updateRadius = () => {
        var R = document.getElementById("radius")
        setRadius(R.value);
    }

    const updateDataset = () => {
        var D = document.getElementById("dataset")
        setDataset(D.value);
    }

    return (
        <div className='Container'>
        <h1 className='head' id="heading"> CSC4130 Project</h1>
        <h2 className='head' id="heading">Interactive K-Means Algorithm</h2>
        <h4 className='head' id="heading">Xingyan Shi 120010030</h4>
        <table id="content">
            <tbody>
                <tr>
                    <td>
                        <div className="App">
                        <ScatterPlot config={radius} radius={radius} data={data} updateData={settmpData}/>
                        </div>
                    </td>
                    <td>
                        <div id="instr">
                            <p id="subheading">Description</p>
                            <p>
                                The graph is an implementation of the K-Means algorithm, which seperates the data into different clusters. 
                                It is applied to a set of data points, each color represents a different cluster. 
                            </p>
                            <p id="subheading">Instruction</p>
                            <p>
                                Hold Shift key and click on data points to select them, you can select any number of data points. 
                                Then release Shift key, click and drag on the graph to move the selected data points. 
                                Hold Shift and click on selected data points to unselect them. 
                            </p>
                        </div> 
                        <div className="input" id="dashboard">
                            <p>
                                Below are some hyperparameters you can interact with. <br></br>
                                Number of clusters changes the number of clusters the algorithm will seperate the data into, minimum is 2, maximum is 10<br></br>
                                Number of iterations changes the number of iterations the algorithm will run, minimum is 1, maximum is 10000<br></br>
                                Circle radius changes the data point circle size, minimum is 2, maximum is 10<br></br>
                                Choose Dataset changes the default dataset used by the algorithm, there are three datasets: Linear-like, Blob-like, and Random<br></br>
                            </p>
                            <label>Number of Clusters </label>
                            <input type='number' id="n_clusters" max="10" min="2" value={n_clus} onChange={updateparam}></input><br></br>
                            <label>Number of Iterations </label>
                            <input type='number' id="n_iters" min="1" max="10000" value={n_iters} onChange={updateparam}></input><br></br>
                            <label>Circle Radius </label>
                            <input type='number' id="radius" max="10" min="2" value={radius} onChange={updateRadius}></input><br></br>
                            <label>Choose Dataset </label>
                            <select id="dataset" onChange={updateDataset}>
                                <option value="1">Linear-like Data</option>
                                <option value="2">Blob-like Data</option>
                                <option value="3">Random Data</option>
                            </select><br></br>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colSpan="2">
                        <div id="responce">
                            <h3 id="heading">Evaluation</h3>
                            <p>
                                Below are some questions to help us evaluate this page, please answer to help us improve this page. 
                            </p>
                            <form action="#">
                                <label>How would you rate your overall experience? 1 being the worst, 5 being the best</label><br></br>
                                <label>1</label>
                                <input type="radio" name="overall" value="1"></input>
                                <label>2</label>
                                <input type="radio" name="overall" value="2"></input>
                                <label>3</label>
                                <input type="radio" name="overall" value="3"></input>
                                <label>4</label>
                                <input type="radio" name="overall" value="4"></input>
                                <label>5</label>
                                <input type="radio" name="overall" value="5"></input><br></br>

                                <label>How would you rate your experience when interacting with the graph? 1 being the worst, 5 being the best</label><br></br>
                                <label>1</label>
                                <input type="radio" name="graph" value="1"></input>
                                <label>2</label>
                                <input type="radio" name="graph" value="2"></input>
                                <label>3</label>
                                <input type="radio" name="graph" value="3"></input>
                                <label>4</label>
                                <input type="radio" name="graph" value="4"></input>
                                <label>5</label>
                                <input type="radio" name="graph" value="5"></input><br></br>

                                <label>How would you rate this webapp in presenting how data quality can affect the result of clustering algorithms? 1 being the worst, 5 being the best</label><br></br>
                                <label>1</label>
                                <input type="radio" name="graph" value="1"></input>
                                <label>2</label>
                                <input type="radio" name="graph" value="2"></input>
                                <label>3</label>
                                <input type="radio" name="graph" value="3"></input>
                                <label>4</label>
                                <input type="radio" name="graph" value="4"></input>
                                <label>5</label>
                                <input type="radio" name="graph" value="5"></input><br></br>

                                <label>What did you learn about data quality using this webapp?</label><br></br>
                                <textarea rows="5" cols="50" placeholder='Input here...'></textarea><br></br>

                                <label>Do you have any other suggestions on improving this page?</label><br></br>
                                <textarea rows="5" cols="50" placeholder='Input here...'></textarea><br></br>

                                <button type="submit">Submit</button>
                            </form>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    );
}

export default App;
