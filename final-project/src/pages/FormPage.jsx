import Nav from "../components/Nav";
import FormResponse from "../components/FormResponse";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(3, "Tehtävän nimessä pitää olla vähintään 3 merkkiä!"),
    description: z.string().min(10, "Tehtävän kuvauksessa pitää olla vähintään 10 merkkiä!"),
    priority: z
        .string()
        .refine((value) => ["high", "med", "low"].includes(value), {
            message: "Valitse prioriteetti listasta.",
        }),
});

function FormPage() {
    const [values, setValues] = useState({
        name: "",
        description: "",
        priority: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [apiResponse, setApiResponse] = useState(null);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    async function handleSubmit(event) {
        event.preventDefault();

        const result = formSchema.safeParse(values);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setErrors(fieldErrors);
            setSuccessMessage("");
            setApiResponse(null);
            return;
        }

        setErrors({});
        setSuccessMessage("");
        setLoading(true);

        try {
            const response = await fetch("https://httpbin.org/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(result.data),
            });

            const data = await response.json();

            setApiResponse(data);
            setSuccessMessage("Form submitted and sent to server successfully! 🎉");
        } catch (error) {
            console.error(error);
            setSuccessMessage("Something went wrong while sending data ❌");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-container">
            <Nav />
            <main className="main-content">
                <div className="header">
                    <header>
                        <h1>Lisää uusi tehtävä</h1>
                    </header>
                </div>

                <form className="task-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Tehtävän nimi</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className={errors.name?.[0] ? "input-error" : ""}
                            aria-invalid={Boolean(errors.name?.[0])}
                            value={values.name}
                            onChange={handleChange}
                        />
                        {errors.name?.[0] && <p className="error-message">{errors.name[0]}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Kuvaus</label>
                        <textarea
                            id="description"
                            name="description"
                            className={errors.description?.[0] ? "input-error" : ""}
                            aria-invalid={Boolean(errors.description?.[0])}
                            value={values.description}
                            onChange={handleChange}
                        />
                        {errors.description?.[0] && <p className="error-message">{errors.description[0]}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Prioriteetti</label>
                        <select
                            id="priority"
                            name="priority"
                            className={errors.priority?.[0] ? "input-error" : ""}
                            aria-invalid={Boolean(errors.priority?.[0])}
                            value={values.priority}
                            onChange={handleChange}
                        >
                            <option value="">Valitse prioriteetti</option>
                            <option value="high">Korkea</option>
                            <option value="med">Keskitaso</option>
                            <option value="low">Matala</option>
                        </select>
                        {errors.priority?.[0] && <p className="error-message">{errors.priority[0]}</p>}
                    </div>

                    <button className="submit-btn" type="submit">Tallenna</button>
                </form>
                <FormResponse
                    loading={loading}
                    successMessage={successMessage}
                    apiResponse={apiResponse}
                />
            </main>
        </div>
    );
}

export default FormPage;
