import { useState } from 'react';
import { toast } from 'sonner';

const useFetch = (cb, options) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fn = async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const response = await cb(...args);
            setData(response);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
              toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }
    return {
        data,
        loading,
        error,
        fn,
        setData,
    }
}

export default useFetch;