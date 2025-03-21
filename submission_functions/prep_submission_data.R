prep_submission_data <- function(conn, submission_obj){
  overview_table = generate_db_overview_table(conn)
  
  submission_obj$publication_data = prep_publication_data(submission_obj$publication_data, overview_table)
  
  n_statementsets = length(submission_obj$statementset_info)
  if (n_statementsets > 0){
    for (istatementset in 1:n_statementsets){
      submission_obj$statementset_info[[istatementset]]$statementset_data = prep_statementset_data(submission_obj$statementset_info[[istatementset]]$statementset_data, overview_table)
    }
  }
  
  n_studies = length(submission_obj$study_info)
  for (istudy in 1:n_studies){
    submission_obj$study_info[[istudy]]$study_data = prep_study_data(submission_obj$study_info[[istudy]]$study_data, overview_table)
    
    if ("within_data" %in% names(submission_obj$study_info[[istudy]])){
      submission_obj$study_info[[istudy]]$within_data = prep_within_data(submission_obj$study_info[[istudy]]$within_data, overview_table)
    }
    if ("between_data" %in% names(submission_obj$study_info[[istudy]])){
      submission_obj$study_info[[istudy]]$between_data = prep_between_data(submission_obj$study_info[[istudy]]$between_data, overview_table)
    }
    submission_obj$study_info[[istudy]]$presentation_data = prep_repetition_data(submission_obj$study_info[[istudy]]$repetition_data, overview_table)
    submission_obj$study_info[[istudy]]$raw_data = prep_raw_data(submission_obj$study_info[[istudy]]$raw_data, overview_table)
    
    if ("measurement_data" %in% names(submission_obj$study_info[[istudy]])){
      submission_obj$study_info[[istudy]]$measurement_data = prep_measurement_data(submission_obj$study_info[[istudy]]$measurement_data, overview_table)
    }
  }
  
  return(submission_obj)
}
