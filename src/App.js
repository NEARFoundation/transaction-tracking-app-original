import 'regenerator-runtime/runtime'
import React, {useState, useEffect} from 'react'
import './global.css'
import CsvDownload from 'react-json-to-CSV'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MultiSelect from "react-select";
import { getFormattedUtcDatetime, getFilename } from './helpers/datetime';
import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development');

const { exampleAccount } = nearConfig;

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
    const [accountsStatus, setAccountsStatus] = useState([]);

    useEffect(() => {
        getTypes().then();
        getAccounts().then();
        setInterval(() => {
            getAccounts().then();
        }, 30000);

    }, []);

    useEffect(() => {
        localStorage.setItem("accountIDs", JSON.stringify(accountIDs));
        setAllTransactions([]);
        getAccounts().then();
    }, [accountIDs]);

    useEffect(() => {
        setMsg('');
        if (selectedAccountId) getTransactions(selectedAccountId).then();
        localStorage.setItem("rangeDate", JSON.stringify({startDate, endDate}));
        setAllTransactions([]);
    }, [startDate, endDate, selectedTypes]);

    const MultiSelectStyles = {
        valueContainer: (base) => ({
            ...base,
            maxHeight: 500,
            overflowY: "auto"
        }),
    };

    function onChangeTypes(value, event) {
        if (event.action === "select-option" && event.option.value === '*') {
            if (selectedTypes.length === types.length) setSelectedTypes([]);
            else setSelectedTypes(types);
        } else {
            setSelectedTypes(value);
        }
    }

    const getAccounts = async () => {

        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({accountId: JSON.parse(localStorage.getItem("accountIDs"))})
        };
        await fetch(
            process.env.REACT_APP_API + "/accounts", requestOptions
        ).then(async response => {
            const data = await response.json();
            //console.log(data['accounts']);
            setAccountsStatus(data['accounts']);
        }).catch(error => {
            setAccountsStatus([]);
            console.error('There was an error!', error);
            setMsg('Unknown error!');
        });
    }

    const getAccountStatus = (accountId) => {
        if (accountsStatus.length > 0) {
            const res = accountsStatus.filter(function (item) {
                return item.accountId === accountId;
            });
            return res[0] ? res[0]: [];
        }
    }

    const getTransactions = async (accountId) => {
        setMsg('');
        setSelectedAccountId(accountId);
        console.log('getTransactions', accountId, startDate, endDate);
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                types: Array.isArray(selectedTypes) ? selectedTypes.map(x => x.value) : [],
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
            if (data.lastUpdate > 0) setLastUpdate(getFormattedUtcDatetime(data.lastUpdate));
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
                types: Array.isArray(selectedTypes) ? selectedTypes.map(x => x.value) : [],
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
            if (data.transactions.length === 0) setMsg(' Check back later. No data for the CSV file');
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

    const { explorerUrl } = nearConfig;

    return (
        <main>
            <nav>
                <h1>Welcome to NEAR!</h1>
                <div style={{textAlign: "center"}}>

                    {accountIDs.length > 0 ?
                        <>
                            <table>
                                <thead>
                                <tr>
                                    <th>Account ID</th>
                                    <th>Status</th>
                                    <th>Last Update</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {accountIDs.map((accountId, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="accountId" title="Show transactions for this account"
                                                 onClick={() => getTransactions(accountId)}>{accountId}</div>
                                        </td>
                                        <td>{getAccountStatus(accountId) ? getAccountStatus(accountId).status : null }</td>
                                        <td>{getAccountStatus(accountId) ? getFormattedUtcDatetime(getAccountStatus(accountId).lastUpdate) : null }</td>
                                        <td>
                                            <button style={{backgroundColor: "#ccc", color: "#000000"}}
                                                    onClick={() => setAccountIDs(accountIDs.filter(item => item !== accountId))}>Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr key="addAccountId">
                                    <td>
                                        <form onSubmit={handleSubmit}>
                                            <input type="text" onChange={handleChange} value={newAccountId}
                                                   placeholder="Add new account"/>
                                        </form>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                </tbody>
                            </table>
                        </>
                        : <>
                            <p>
                                Enter the account ID:
                            </p>
                            <form onSubmit={handleSubmit}>
                                <input type="text" onChange={handleChange} value={newAccountId} placeholder={exampleAccount} />
                                <button type="submit">Add</button>
                            </form>
                        </>
                    }

                </div>
                {msg ? <div className="msg">{msg}</div> : null}
                <div>
                    <hr/>
                    {accountIDs.length > 0 ?
                        <>

                            <div style={{textAlign: 'center', paddingBottom: '6px'}}>
                                From: <DatePicker selected={startDate} onChange={(date) => setStartDate(date)}
                                                  showMonthDropdown showYearDropdown dateFormat="yyyy-MM-dd"/>
                                To: <DatePicker selected={endDate} onChange={(date) => setEndDate(date)}
                                                showMonthDropdown showYearDropdown dateFormat="yyyy-MM-dd"/>
                            </div>


                            <MultiSelect
                                options={[{label: "--- Select All ---", value: "*"}, ...types]}
                                placeholder="Select transaction types"
                                value={selectedTypes}
                                onChange={onChangeTypes}
                                setState={setSelectedTypes}
                                isMulti
                                styles={MultiSelectStyles}
                            />


                            {
                                allTransactions.length > 0 ?
                                    <>
                                        <button onClick={getAllTransactions}
                                                style={{backgroundColor: "#175730"}}>Update
                                            data for the CSV file
                                        </button>
                                        <CsvDownload data={allTransactions}
                                                     filename={getFilename(startDate, endDate)}
                                                     style={{backgroundColor: "#175730"}}>Download CSV
                                            file</CsvDownload>
                                    </>
                                    : <button onClick={getAllTransactions} style={{backgroundColor: "#175730"}}>Prepare
                                        data for the CSV file</button>
                            }
                            <hr/>
                        </>
                        : null}
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
                                        href={`${explorerUrl}/transactions/${item.transaction_hash}`}>{item.transaction_hash}</a>
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
