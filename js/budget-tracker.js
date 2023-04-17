export default class budgetTracker {
    constructor(querySelectorString){
        this.root = document.querySelector(querySelectorString)
        this.root.innerHTML = budgetTracker.html()

        this.root.querySelector(".new-entry").addEventListener("click" , () => this.onNewEntryBtnClick())
        this.load()
    }
    
    static html(){
        return `
        <table class="budget-tracker">
        <thead>
            <tr>
                <th>date</th>
                <th>description</th>
                <th>type</th>
                <th>amount</th>
                <th></th>
            </tr>
        </thead>
    
        <tbody class="entry">
            
        </tbody>
    
        <tbody>
            <tr>
                <td colspan="5" class="control">
                    <button type="button" class="new-entry">New Entry</button>
                </td>
            </tr>
        </tbody>
    
        <tfoot>
            <tr>
                <td colspan="5" class="summary">
                    <strong>Total:</strong>
                    <span class="total">RM0.00</span>
                </td>
            </tr>
        </tfoot>
        </table>
        `
    }

    static entryHtml(){
        return `
            <tr>
            <td>
                <input class="input input-date" type="date">
            </td>
            <td>
                <input class="input input-description" type="text" placeholder="enter description">
            </td>
            <td>
                <select class="input input-type">
                    <option value="income">Income</option>
                    <option value="expenses">Expenses</option>
                </select>
            </td>
            <td>
                <input class="input input-amount" type="number">
            </td>
            <td>
                <button class="delete-entry" type="button">&#10005;</button>
            </td>
        </tr>
        `
    }

    load(){
        const entries = JSON.parse(localStorage.getItem("budget-tracker-entries-dev")||"[]")
        
        for (const entry of entries) {
            this.addEntry(entry)
        }

        this.updateSummary()
    }

    updateSummary(){
        const total = this.getEntryRows().reduce((sum,row) =>{
            const amount= row.querySelector(".input-amount").value
            let isExpense = false
            if(row.querySelector(".input-type").value=="expenses"){
                isExpense = true
            }
            const modifier = isExpense? -1 : 1

            return sum+(amount*modifier)
        },0)

        this.root.querySelector(".total").innerText = `RM${total}`
    }

    save(){
        const data = this.getEntryRows().map(row =>{
            return{
                date: row.querySelector(".input-date").value,
                description: row.querySelector(".input-description").value,
                type: row.querySelector(".input-type").value,
                amount: parseFloat(row.querySelector(".input-amount").value)
            }
        })
        localStorage.setItem("budget-tracker-entries-dev",JSON.stringify(data))
        this.updateSummary()
    }

    addEntry(entry={}){
        this.root.querySelector(".entry").insertAdjacentHTML("beforeend" , budgetTracker.entryHtml())
        //this must be insertAdjacentHTML beforeend instead of afterbegin because we want to add the new entry before the end of the class entry which is after the newest entries

        const row = this.root.querySelector(".entry tr:last-of-type")
        //this must be last-of-type so that the program will know that we want to apply the default things at the bottom of this comment to the newest entry added
        
        row.querySelector(".input-date").value = entry.date || new Date().toISOString().replace(/T.*/,"")
        row.querySelector(".input-description").value = entry.description || ""
        row.querySelector(".input-type").value = entry.type || "income"
        row.querySelector(".input-amount").value = entry.amount || 0
        row.querySelector(".delete-entry").addEventListener("click", e =>{
            this.onDeleteEntryBtnClick(e)
    })
        
        row.querySelectorAll(".input").forEach(input => {
            input.addEventListener("change",() => this.save())
        });
    }

    getEntryRows(){
        return Array.from(this.root.querySelectorAll(".entry tr"))
    }

    onNewEntryBtnClick(){
        this.addEntry()
    }

    onDeleteEntryBtnClick(e){
        e.target.closest("tr").remove()
        this.save()
    }
}
