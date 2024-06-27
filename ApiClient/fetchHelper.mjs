const options = {
    headers: {
        'Accept': '*/*',
    },
    credentials: 'include', // credentials means include cookies
};


export default async function doFetch(baseURL, endpoint, method="GET", data=undefined) {
    options.method = method;

    // Check if the data is an instance of FormData
    if (data instanceof FormData) {
        options.body = data;
        // When using FormData, the browser will automatically set the correct Content-Type with boundary
        delete options.headers['Content-Type'];
    }
    else {
        options.headers['Content-Type'] = 'application/json';
        options.body = data ? JSON.stringify(data) : undefined;
    }

    try {
        return await fetch(baseURL + endpoint, options);
    } 
    catch (err) {
        console.error('Fetch error:', err);
        throw err; // Re-throw the error so it can be handled by the caller
    }
}

