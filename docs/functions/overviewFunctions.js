function addOverview(control) {
    // Create a new list item for the dataset
    const listItem = document.createElement("li");
    listItem.className = "collapsible collapsible-nocontent";

    // Create a span for the dataset name
    const span = document.createElement("span");
    span.textContent = "Overview";

    // Append the span and actions to the list item
    listItem.appendChild(span);

    // Create a nested list for raw data
    const nestedList = document.createElement("ul");

    // Append the nested list to the dataset item
    listItem.appendChild(nestedList);

    // Append the new list item to the sidebar
    document.getElementById("sidebarList").appendChild(listItem);

    // Update content area
    span.addEventListener("click", function(event) {
        event.stopPropagation(); // Prevent the collapsible toggle
        generateOverviewPage(control);
    });
}

function generateOverviewPage(control) {
    document.getElementById("content").innerHTML = `
        <div class = "display-text">
            <h1>Welcome to the Truth Effect Data Entry Page</h1>
            <p>Thank you for contributing to our growing database of truth effect research. By entering your data here, you help make research more accessible and reusable for everyone.</p>
            <p>You can explore and download the dataset under this link: <a href="https://example.com/dataset" target="_blank">Dataset Link</a></p>
            <p>On the side, you find a navigation page to enter your data. We recommend you start with "Publication" to provide general information about the publication, then move on to "Sets of Statements" in order to upload the statements you used in your studies and then enter information about each individual study. You may add as may studies in your publication as you wish.</p>
            <p>In order to properly integrate your data into our database, we ask you to follow our instructions precisely. Importantly, this includes our restrictions placed on the uploaded data. Make sure that your column names match ours exactly and that the identifiers in the raw data match those you enter in the respective overview surveys.</p>
            <p>After submission, our team will review your data and add it to the database as soon as possible.</p>

            ${printProgressReport(getNumberOfSubmissions(control))}

            <div class="my-4">
                <h2>Save / Load / Submit</h2>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-info" onclick="saveProgress(control)">
                        <i class="bi bi-save"></i> Save Progress
                    </button>

                    <button class="btn btn-warning" id="uploadProgressButton">
                        <i class="bi bi-upload"></i> Upload Progress
                    </button>

                    <button class="btn btn-success" onclick="submitData(control)" id="final-submit-button">
                        <i class="bi bi-check-circle"></i> Submit Data
                    </button>

                    <input type="file" id="progressFileInput" accept=".json" style="display: none;">
                </div>
            </div>

            
            <h2>Contact Information</h2>
            <p>If you have any questions or need assistance, feel free to contact us at: <br>
                <a href="mailto:sven.lesche@psychologie.uni-heidelberg.de">sven.lesche@psychologie.uni-heidelberg.de</a><br>
                <a href="mailto:annika.stump@psychologie.uni-freiburg.de">annika.stump@psychologie.uni-freiburg.de</a>
            </p>
        </div>
    `;

    document.getElementById('uploadProgressButton').addEventListener('click', function() {
        document.getElementById('progressFileInput').click();
    });

    document.getElementById('progressFileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const progressData = JSON.parse(e.target.result);

                if (progressData.progress_file) {
                    // Simulate Clicks on Add Study and StatementSet
                    initializeNavbarFromProgress(progressData);
                    // Override the existing control object
                    Object.assign(control, progressData);
                    addCheckmarksFromProgress(control);
                    // initializePublicationSurvey(control); // Initialize the publication survey with the updated control object
                    // console.log(control);
                } else {
                    alert("Invalid progress file. Please upload a valid progress file.");
                }
            };
            reader.readAsText(file);
        }
    });
}

function getNumberOfSubmissions(control) {
    const num_total_publications = Object.keys(control.publication_info).length;
    const num_statement_sets = Object.keys(control.statementset_info).length;
    let num_total_studies = 0;

    let num_statement_sets_validated = 0;
    let num_publications_validated = 0;
    let num_studies_validated = 0;

    let total_checkpoints = 0;
    let validated_checkpoints = 0;

    for (let statementset_idx = 0; statementset_idx < num_statement_sets; statementset_idx++) {
        total_checkpoints++; // One checkpoint per statement set
        if (control.statementset_info[statementset_idx].statementset_data.validated) {
            num_statement_sets_validated += 1;
            validated_checkpoints++;
        }
    }

    for (let publication_idx in control.publication_info) {
        const publication = control.publication_info[publication_idx];
        const current_num_studies = Object.keys(publication.study_info).length;
        num_total_studies += current_num_studies;

        total_checkpoints++; // One per publication
        if (publication.publication_data.validated) {
            num_publications_validated += 1;
            validated_checkpoints++;
        }

        for (let study_idx in publication.study_info) {
            const study = publication.study_info[study_idx];
            total_checkpoints++; // Main study validation
            if (study.study_data.validated) {
                num_studies_validated += 1;
                validated_checkpoints++;
            }

            // Sub-validations
            const subkeys = ['procedure', 'conditions', 'measures', 'raw_data'];
            subkeys.forEach(key => {
                total_checkpoints++;
                if (study.study_data[key] && study.study_data[key].validated) {
                    validated_checkpoints++;
                }
            });
        }
    }

    const percent_statement_sets_validated = (num_statement_sets_validated / num_statement_sets) * 100;
    const percent_publication_validated = (num_publications_validated / num_total_publications) * 100;
    const percent_studies_validated = (num_studies_validated / num_total_studies) * 100;
    const percent_overall_validated = (validated_checkpoints / total_checkpoints) * 100;

    return {
        num_total_publications,
        num_statement_sets,
        num_total_studies,
        num_statement_sets_validated,
        num_publications_validated,
        num_studies_validated,
        percent_statement_sets_validated,
        percent_publication_validated,
        percent_studies_validated,
        percent_overall_validated,
        total_checkpoints,
        validated_checkpoints
    };
}

function printProgressReport(progress_report) {
    return `
        <div class="progress-report card my-4">
            <div class="card-body">
                <h2 class="card-title">Progress Report</h2>

                <p><strong>Total Publications:</strong> ${progress_report.num_total_publications}</p>
                <p><strong>Total Statement Sets:</strong> ${progress_report.num_statement_sets}</p>
                <p><strong>Total Studies:</strong> ${progress_report.num_total_studies}</p>

                <div class="mb-3">
                    <label><strong>Publications Validated:</strong> ${progress_report.num_publications_validated}</label>
                    <div class="progress">
                        <div class="progress-bar bg-primary" role="progressbar" 
                            style="width: ${progress_report.percent_publication_validated.toFixed(1)}%;" 
                            aria-valuenow="${progress_report.percent_publication_validated.toFixed(1)}" 
                            aria-valuemin="0" aria-valuemax="100">
                            ${progress_report.percent_publication_validated.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label><strong>Studies Validated:</strong> ${progress_report.num_studies_validated}</label>
                    <div class="progress">
                        <div class="progress-bar bg-info" role="progressbar" 
                            style="width: ${progress_report.percent_studies_validated.toFixed(1)}%;" 
                            aria-valuenow="${progress_report.percent_studies_validated.toFixed(1)}" 
                            aria-valuemin="0" aria-valuemax="100">
                            ${progress_report.percent_studies_validated.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label><strong>Statement Sets Validated:</strong> ${progress_report.num_statement_sets_validated}</label>
                    <div class="progress">
                        <div class="progress-bar bg-warning" role="progressbar" 
                            style="width: ${progress_report.percent_statement_sets_validated.toFixed(1)}%;" 
                            aria-valuenow="${progress_report.percent_statement_sets_validated.toFixed(1)}" 
                            aria-valuemin="0" aria-valuemax="100">
                            ${progress_report.percent_statement_sets_validated.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <hr>

                <div class="mb-3">
                    <label><strong>Overall Progress:</strong> ${progress_report.validated_checkpoints} / ${progress_report.total_checkpoints}</label>
                    <div class="progress">
                        <div class="progress-bar bg-success" role="progressbar" 
                            style="width: ${progress_report.percent_overall_validated.toFixed(1)}%;" 
                            aria-valuenow="${progress_report.percent_overall_validated.toFixed(1)}" 
                            aria-valuemin="0" aria-valuemax="100">
                            ${progress_report.percent_overall_validated.toFixed(1)}%
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}
