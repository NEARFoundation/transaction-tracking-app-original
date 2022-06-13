import 'regenerator-runtime/runtime'
import React, {useState, useEffect} from 'react'
import './global.css'
import CsvDownload from 'react-json-to-csv'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Multiselect from 'multiselect-react-dropdown';

export default function App() {
    const [msg, setMsg] = useState('');
    const [newAccountId, setNewAccountId] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [types, setTypes] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [lastUpdate, setLastUpdate] = useState('');
    const [startDate, setStartDate] = useState(() => {
        const saved = localStorage.getItem("rangeDate");
        const initialValue = JSON.parse(saved);
        if (initialValue) {
            return new Date(initialValue.startDate);
        } else {
            const start = new Date();
            start.setUTCHours(0, 0, 0, 0);
            return new Date(start);
        }
    });
    const [endDate, setEndDate] = useState(() => {
        const saved = localStorage.getItem("rangeDate");
        const initialValue = JSON.parse(saved);
        if (initialValue) {
            return new Date(initialValue.endDate);
        } else {
            const end = new Date();
            end.setUTCHours(23, 59, 59, 999);
            return new Date(end);
        }
    });

    const [accountIDs, setAccountIDs] = useState(() => {
        const saved = localStorage.getItem("accountIDs");
        const initialValue = JSON.parse(saved);
        return initialValue || [];
    });

    useEffect(() => {
        getTypes();
    }, []);

    useEffect(() => {
        localStorage.setItem("accountIDs", JSON.stringify(accountIDs));
        setAllTransactions([]);
    }, [accountIDs]);

    useEffect(() => {
        setMsg('');
        if (selectedAccountId) getTransactions(selectedAccountId).then();
        localStorage.setItem("rangeDate", JSON.stringify({startDate, endDate}));
        setAllTransactions([]);
    }, [startDate, endDate, selectedTypes]);

    const getTransactions = async (accountId) => {
        setMsg('');
        setSelectedAccountId(accountId);
        console.log('getTransactions', accountId, startDate, endDate);
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                types: Array.isArray(selectedTypes) ? selectedTypes.map(x => x.name) : [],
                accountId: [accountId],
                startDate: startDate,
                endDate: endDate
            })
        };
        await fetch(
            process.env.REACT_APP_API + "/transactions", requestOptions
        ).then(async response => {
            const data = await response.json();
            setTransactions(data.transactions);
            if (data.lastUpdate > 0) setLastUpdate(new Date(data.lastUpdate).toLocaleString());
            else setLastUpdate('');
        }).catch(error => {
            setTransactions([]);
            console.error('There was an error!', error);
            setMsg('Unknown error!');
        });
    }

    const getAllTransactions = async () => {
        setMsg('');
        console.log('getAllTransactions', accountIDs);
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                types: Array.isArray(selectedTypes) ? selectedTypes.map(x => x.name) : [],
                accountId: accountIDs,
                startDate: startDate,
                endDate: endDate
            })
        };
        await fetch(
            process.env.REACT_APP_API + "/transactions", requestOptions
        ).then(async response => {
            const data = await response.json();
            setAllTransactions(data.transactions);
            console.log(data.transactions);
        }).catch(error => {
            console.error('There was an error!', error);
            setMsg('Unknown error!');
            setAllTransactions([]);
        });
    }

    const handleChange = (e) => {
        setNewAccountId(e.target.value);
        console.log('handleChange');
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('handleSubmit', newAccountId);
        if (newAccountId) addTasks().then();
    }

    const addTasks = async () => {
        setNewAccountId('');
        setMsg('');
        console.log('newTasks:', newAccountId);
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({accountId: newAccountId})
        };
        await fetch(process.env.REACT_APP_API + '/add-tasks', requestOptions)
            .then(async response => {
                if (response.status === 200) {
                    if (accountIDs.indexOf(newAccountId) === -1) setAccountIDs([...accountIDs, newAccountId]);
                } else if (response.status === 400) {
                    const status = await response.json();
                    setMsg(status.error);
                    console.error(status.error);
                }
            })
            .catch(error => {
                console.error('Unknown error!', error);
                setMsg('Unknown error!');
            });
    }

    const getTypes = async () => {
        const requestOptions = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        };
        await fetch(
            process.env.REACT_APP_API + "/types", requestOptions
        ).then(async response => {
            const types = await response.json();
            setTypes(types['types']);
        }).catch(error => {
            console.error('There was an error!', error);
        });
    }

    return (
        <main>
            <nav>
                <h1>Welcome to NEAR!</h1>
                <p>
                    Enter your account id:
                </p>
                <div style={{display: 'flex'}}>
                    <form onSubmit={handleSubmit}>
                        <input type="text" onChange={handleChange} value={newAccountId}/>
                        <button type="submit">Add</button>
                    </form>
                </div>
                {msg ? <div className="msg">{msg}</div> : null}
                <div>
                    <hr/>
                    {accountIDs.length > 0 ?
                        <>
                            <div>
                                From: <DatePicker selected={startDate} onChange={(date) => setStartDate(date)}
                                                  showMonthDropdown showYearDropdown/>
                                To: <DatePicker selected={endDate} onChange={(date) => setEndDate(date)}
                                                showMonthDropdown showYearDropdown/>
                            </div>

                            <Multiselect
                                options={types} // Options to display in the dropdown
                                selectedValues={selectedTypes} // Preselected value to persist in dropdown
                                onSelect={(selectedList) => setSelectedTypes(selectedList)} // Function will trigger on select event
                                onRemove={(selectedList) => setSelectedTypes(selectedList)} // Function will trigger on remove event
                                displayValue="name" // Property name to display in the dropdown options
                                placeholder="Select transaction type"
                                maxDisplayedItems={10}
                            />


                            {
                                allTransactions.length > 0 ?
                                    <>
                                        <button onClick={getAllTransactions}
                                                style={{backgroundColor: "#175730"}}>Update
                                            data for the csv file
                                        </button>
                                        <CsvDownload data={allTransactions}
                                                     filename={`transactions_${startDate.toLocaleString()}-${endDate.toLocaleString()}.csv`}
                                                     style={{backgroundColor: "#175730"}}>Download csv
                                            file</CsvDownload>
                                    </>
                                    : <button onClick={getAllTransactions} style={{backgroundColor: "#175730"}}>Prepare
                                        data for the csv file</button>
                            }
                            <hr/>
                        </>
                        : null}

                    {accountIDs.map((accountId, index) => (
                        <span key={index}>
                            <button onClick={() => getTransactions(accountId)}>{accountId}</button>
                        </span>
                    ))}

                </div>
            </nav>
            <div style={{paddingTop: "10px", textAlign: "center"}}>
                {selectedAccountId ?
                    <>
                        {lastUpdate ?
                            <div>{selectedAccountId}. Last update: {lastUpdate}</div>
                            : <div>{selectedAccountId}. Check back later</div>
                        }
                    </> : null}

                {transactions.length > 0 ?
                    <>
                        <table>
                            <thead>
                            <tr>
                                <th>accountId</th>
                                <th>txType</th>
                                <th>block_timestamp</th>
                                <th>from_account</th>
                                <th>block_height</th>
                                <th>args_base64</th>
                                <th>transaction_hash</th>
                                <th>amount_transferred</th>
                                <th>currency_transferred</th>
                                <th>amount_transferred2</th>
                                <th>currency_transferred2</th>
                                <th>receiver_owner_account</th>
                                <th>receiver_lockup_account</th>
                                <th>lockup_start</th>
                                <th>lockup_duration</th>
                                <th>cliff_duration</th>
                                <th>date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.accountId}</td>
                                    <td>{item.txType}</td>
                                    <td>{item.block_timestamp}</td>
                                    <td>{item.from_account}</td>
                                    <td>{item.block_height}</td>
                                    <td>{item.args_base64}</td>
                                    <td><a
                                        href={`https://explorer.mainnet.near.org/transactions/${item.transaction_hash}`}>{item.transaction_hash}</a>
                                    </td>
                                    <td>{item.amount_transferred}</td>
                                    <td>{item.currency_transferred}</td>
                                    <td>{item.amount_transferred2}</td>
                                    <td>{item.currency_transferred2}</td>
                                    <td>{item.receiver_owner_account}</td>
                                    <td>{item.receiver_lockup_account}</td>
                                    <td>{item.lockup_start}</td>
                                    <td>{item.lockup_duration}</td>
                                    <td>{item.cliff_duration}</td>
                                    <td>{new Date(item.block_timestamp / 1000000).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                    : null
                }
                {transactions.length === 0 && selectedAccountId ?
                    <>No data</>
                    : null
                }

            </div>
        </main>
    )
}
